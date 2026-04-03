'use client'

import { useState, useEffect, useCallback } from 'react'
import SplashScreen from './splash-screen'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  // Only show splash once per session
  useEffect(() => {
    const shown = sessionStorage.getItem('fa-splash-shown')
    if (shown) setShowSplash(false)
  }, [])

  const handleSplashDone = useCallback(() => {
    setShowSplash(false)
    sessionStorage.setItem('fa-splash-shown', '1')
  }, [])

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {children}
    </>
  )
}
