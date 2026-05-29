import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})
