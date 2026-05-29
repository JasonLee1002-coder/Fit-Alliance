import { generateText } from 'ai'
import { googleAI } from '@/lib/google-ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json({ error: '請上傳圖片' }, { status: 400 })
    }

    const arrayBuffer = await image.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const mimeType = (image.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const { text } = await generateText({
      model: googleAI('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: uint8Array,
              mimeType,
            },
            {
              type: 'text',
              text: `這是一張體重計或體脂計的螢幕截圖/照片。請識別畫面中的所有數值。

請用以下 JSON 格式回覆（只回覆 JSON，不要其他文字）：
{
  "weight": 體重數值(kg) 或 null,
  "body_fat": 體脂率(%) 或 null,
  "muscle_mass": 肌肉量(kg) 或 null,
  "visceral_fat": 內臟脂肪指數 或 null,
  "bone_mass": 骨質量(kg) 或 null,
  "bmi": BMI 或 null,
  "bmr": 基礎代謝率(kcal) 或 null
}

只填入你能確定識別的數值，其他填 null。`,
            },
          ],
        },
      ],
    })

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const result = JSON.parse(cleaned)
      return NextResponse.json(result)
    } catch {
      return NextResponse.json({ error: '無法辨識圖片中的數值' }, { status: 422 })
    }
  } catch (error) {
    console.error('Scale recognize error:', error)
    return NextResponse.json({ error: '辨識失敗', detail: String(error) }, { status: 500 })
  }
}
