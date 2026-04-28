import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { uploadToS3 } from '@/lib/s3'

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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `fit-alliance/${bucket}/${user.id}/${Date.now()}_${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const url = await uploadToS3(buffer, key, file.type || 'image/jpeg')

  return Response.json({ url })
}
