'use client'

import { useRouter } from 'next/navigation'

export default function BackToArenaButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-2 px-5 py-3
        bg-gradient-to-b from-amber-400 to-amber-500
        text-white font-black text-base rounded-2xl
        shadow-[0_5px_0_#b45309,0_6px_12px_rgba(180,83,9,0.35)]
        active:shadow-[0_2px_0_#b45309,0_3px_6px_rgba(180,83,9,0.25)]
        active:translate-y-[3px]
        transition-all duration-75
        select-none
      "
    >
      <span className="text-lg">←</span>
      回競技場
    </button>
  )
}
