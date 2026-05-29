import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const ALLOWED_BUCKETS = ['report-screenshots', 'weight-screenshots']
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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${user.id}/${Date.now()}_${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Use service role to bypass RLS on storage
  const serviceSupabase = await createServiceRoleSupabase()
  const { error } = await serviceSupabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false })

  if (error) {
    console.error('Storage upload error:', error)
    return Response.json({ error: '上傳失敗' }, { status: 500 })
  }

  const { data: { publicUrl } } = serviceSupabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return Response.json({ url: publicUrl })
}
