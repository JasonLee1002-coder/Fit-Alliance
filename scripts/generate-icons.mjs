/**
 * 用 Gemini 2.0 Flash 生成可愛卡通圖示 + 教練頭像
 * 執行: node scripts/generate-icons.mjs
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_KEY = 'AIzaSyBdDvCfRK7By8HPOLItGMhOpEGyKSeljdA'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`

const icons = [
  {
    filename: 'nav-icon-checkin.png',
    prompt: `A single cute chibi kawaii cartoon icon of a chubby cheerful character standing happily on a weighing scale, celebrating with arms raised, big sparkling eyes, rosy cheeks, warm smile. The scale shows a number. Colorful, bright warm green background circle, Disney Pixar style, soft rounded shapes, no text, icon style, white background, centered composition, 512x512`
  },
  {
    filename: 'nav-icon-records.png',
    prompt: `A single cute chibi kawaii cartoon icon of a tiny happy character with big eyes sitting on top of a colorful bar chart, the bars look like smiling columns, sparkles around it. Bright soft blue background circle, Disney Pixar style, rounded cute shapes, upward trending arrow, no text, icon style, white background, centered composition, 512x512`
  },
  {
    filename: 'nav-icon-challenge.png',
    prompt: `A single cute chibi kawaii cartoon icon of an adorable golden trophy with big round cartoon eyes, rosy cheeks and a big smile, wearing a crown, sparkles and stars around it. Warm yellow/gold background circle, Disney Pixar style, soft 3D rounded look, gleaming trophy, no text, icon style, white background, centered composition, 512x512`
  },
  {
    filename: 'nav-icon-invite.png',
    prompt: `A single cute chibi kawaii cartoon icon of two tiny adorable cartoon friends, a boy and girl, holding hands together, a heart floating between them, both smiling with big cute eyes and rosy cheeks. Purple/lavender soft background circle, Disney Pixar style, warm and friendly, no text, icon style, white background, centered composition, 512x512`
  },
  {
    filename: 'nav-icon-report.png',
    prompt: `A single cute chibi kawaii cartoon icon of a small round orange character with giant surprised round eyes, tiny mouth in an O shape, holding up a large exclamation mark sign, looking worried but adorable. Warm orange/peach background circle, Disney Pixar style, soft rounded shapes, no text, icon style, white background, centered composition, 512x512`
  },
  {
    filename: 'char-coach-chibi.png',
    prompt: `A full body cute chibi kawaii cartoon fitness coach character, male, friendly and energetic, wearing a bright green sports jersey with "FA" logo, short dark hair, very large sparkling blue eyes, rosy cheeks, huge warm smile showing teeth, giving a thumbs up with one hand, slightly chubby chibi proportions (big head small body), confetti and stars around him. Transparent or white background, Disney Pixar Pixar style, high quality, 512x512`
  }
]

async function generateImage(prompt) {
  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      response_modalities: ['IMAGE', 'TEXT'],
      temperature: 1
    }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()

  // 找到 image part
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))

  if (!imagePart) {
    console.log('Response parts:', JSON.stringify(parts, null, 2).slice(0, 500))
    throw new Error('No image in response')
  }

  return {
    data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType
  }
}

async function main() {
  console.log('🎨 開始用 Gemini 生成可愛圖示...\n')

  for (const icon of icons) {
    console.log(`⏳ 生成: ${icon.filename}...`)

    try {
      const image = await generateImage(icon.prompt)
      const buffer = Buffer.from(image.data, 'base64')
      const outputPath = resolve(__dirname, '../public', icon.filename)
      writeFileSync(outputPath, buffer)
      console.log(`✅ 已儲存: public/${icon.filename} (${(buffer.length / 1024).toFixed(1)} KB)`)
    } catch (err) {
      console.error(`❌ 失敗: ${icon.filename} — ${err.message}`)
    }

    // 避免過快呼叫 API
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n🎉 完成！圖示已儲存到 public/ 資料夾')
}

main().catch(console.error)
