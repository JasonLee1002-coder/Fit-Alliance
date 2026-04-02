import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateWithWeekday(date: Date | string) {
  const d = new Date(date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`
}

export function calculateBMI(weight: number, heightCm: number) {
  const heightM = heightCm / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

export function getStandardWeight(heightCm: number, gender: 'male' | 'female') {
  // BMI 22 as standard
  const heightM = heightCm / 100
  return Math.round(22 * heightM * heightM * 10) / 10
}

export function getBodyFatRange(gender: 'male' | 'female') {
  return gender === 'male'
    ? { min: 10, max: 20, label: '10-20%' }
    : { min: 18, max: 28, label: '18-28%' }
}

export function getWeightChangeColor(change: number, metric: 'weight' | 'bodyFat' | 'muscle') {
  if (metric === 'muscle') {
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
  }
  // Weight & body fat: decrease is positive
  return change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-gray-500'
}

export function generateInviteToken() {
  return crypto.randomUUID()
}
