import { createServerSupabase, createServiceRoleSupabase } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const ALLOWED_BUCKETS = ['meal-photos', 'report-screenshots', 'weight-screenshots']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '請先登入' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null

  if (!file || !bucket) {
    return Response.json({ error: '缺少檔案或 bucket' }, { status: 400 })
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return Response.json({ error: '無效的 bucket' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: '檔案超過 5MB' }, { status: 400 })
  }

  // Upload with service role (bypasses storage RLS)
  let adminSupabase
  try {
    adminSupabase = await createServiceRoleSupabase()
  } catch (e) {
    console.error('[Upload] Service role client failed:', e)
    return Response.json({ error: '伺服器設定錯誤，請聯絡管理員' }, { status: 500 })
  }

  // Sanitize filename to avoid special chars
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = `${user.id}/${Date.now()}_${safeName}`

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data: uploadData, error } = await adminSupabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (error || !uploadData) {
    console.error('[Upload] Failed:', error?.message, error)
    return Response.json({ error: `上傳失敗：${error?.message || '未知錯誤'}` }, { status: 500 })
  }

  const { data: { publicUrl } } = adminSupabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return Response.json({ url: publicUrl })
}
