import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const mode = formData.get('mode') as string | null // 'scale' for weight scale, 'food' for food photo

    if (!image) {
      return NextResponse.json({ error: '請上傳圖片' }, { status: 400 })
    }

    const buffer = Buffer.from(await image.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mimeType = image.type || 'image/jpeg'

    if (mode === 'food') {
      // Food recognition mode
      const { text } = await generateText({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: `data:${mimeType};base64,${base64}`,
              },
              {
                type: 'text',
                text: `分析這張食物照片。辨識所有可見的食物項目。

請用以下 JSON 格式回覆（只回覆 JSON，不要其他文字）：
{
  "items": [
    {
      "name": "食物名稱（繁體中文）",
      "calories": 估算熱量(kcal),
      "protein": 估算蛋白質(g),
      "carbs": 估算碳水化合物(g),
      "fat": 估算脂肪(g),
      "confidence": 0.0-1.0 辨識信心度
    }
  ],
  "overall_assessment": "整體飲食評價（一句話，繁體中文）"
}`,
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
        return NextResponse.json({ items: [], overall_assessment: '無法辨識食物' })
      }
    }

    // Default: Scale OCR mode
    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64}`,
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
    console.error('Food recognize error:', error)
    return NextResponse.json({ error: '辨識失敗' }, { status: 500 })
  }
}
