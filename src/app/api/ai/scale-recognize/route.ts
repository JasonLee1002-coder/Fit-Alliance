import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json({ error: '請上傳圖片' }, { status: 400 })
    }

    const arrayBuffer = await image.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = image.type || 'image/jpeg'

    const apiKey = process.env.GEMINI_API_KEY
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: `這是一張體重計或體脂計的螢幕截圖/照片。請識別畫面中的所有數值。

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

只填入你能確定識別的數值，其他填 null。` }
            ]
          }]
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      console.error('Gemini API error:', err)
      return NextResponse.json({ error: '辨識失敗', detail: err?.error?.message }, { status: 500 })
    }

    const geminiData = await res.json()
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

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
