import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const mode = formData.get('mode') as string | null

    // Support single image (backward compat) or multiple images
    const image = formData.get('image') as File | null
    const images = formData.getAll('images') as File[]
    const allImages = images.length > 0 ? images : image ? [image] : []

    if (allImages.length === 0) {
      return NextResponse.json({ error: '請上傳圖片' }, { status: 400 })
    }

    if (mode === 'food') {
      // Convert all images to base64
      const imageContents = await Promise.all(
        allImages.map(async (img) => {
          const buffer = Buffer.from(await img.arrayBuffer())
          const base64 = buffer.toString('base64')
          const mimeType = img.type || 'image/jpeg'
          return {
            type: 'image' as const,
            image: `data:${mimeType};base64,${base64}`,
          }
        })
      )

      const photoCountHint = allImages.length > 1
        ? `這裡有 ${allImages.length} 張食物照片，請辨識所有照片中的食物。`
        : '這是一張食物照片。'

      const { text } = await generateText({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: `${photoCountHint}請仔細分析每張照片中所有可見的食物項目。

## 分析要求
1. **辨識食物**：列出所有食物，用繁體中文命名
2. **估算份量**：根據照片中食物的大小、容器比例，估算大概份量（如「約一碗」「約一個拳頭大」「約 200g」）
3. **營養估算**：根據估算的份量計算營養素
4. **瘦身建議**：針對每個食物給一句瘦身小技巧

## 回覆格式（只回覆 JSON，不要其他文字）
{
  "items": [
    {
      "name": "食物名稱（繁體中文）",
      "calories": 估算熱量(kcal),
      "protein": 估算蛋白質(g),
      "carbs": 估算碳水化合物(g),
      "fat": 估算脂肪(g),
      "fiber": 估算膳食纖維(g),
      "sodium": 估算鈉(mg),
      "confidence": 0.0-1.0,
      "portion": "估算份量描述（如：約一碗、約150g）",
      "healthTip": "針對此食物的一句瘦身小技巧"
    }
  ],
  "overall_assessment": "整體飲食評價（2-3句，包含營養均衡度、熱量評估、瘦身建議）",
  "diet_tips": [
    "根據這餐內容，給出 2-3 個具體的瘦身飲食技巧"
  ]
}

## 估算規則
- 如果看不清份量，用常見外食份量估算
- 飯類預設一碗約 200g（約 280kcal）
- 肉類用手掌大小估算（一個掌心約 100g）
- 蔬菜用拳頭大小估算
- 湯品預設一碗約 300ml`,
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
        return NextResponse.json({ items: [], overall_assessment: '無法辨識食物', diet_tips: [] })
      }
    }

    // Default: Scale OCR mode (single image only)
    const img = allImages[0]
    const buffer = Buffer.from(await img.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mimeType = img.type || 'image/jpeg'

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
