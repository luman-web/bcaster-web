'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
})

export default function NavigationProgress() {
  const pathname = usePathname()

  useEffect(() => {
    NProgress.done()
  }, [pathname])

  useEffect(() => {
    // Add custom styles for NProgress
    const style = document.createElement('style')
    style.innerHTML = `
      #nprogress .bar {
        background: #1890ff !important;
        height: 3px !important;
        z-index: 9999 !important;
        top: 50px !important;
        position: fixed !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px #1890ff, 0 0 5px #1890ff !important;
      }
    `
    document.head.appendChild(style)

    // Override Link behavior to show progress
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const currentPath = window.location.pathname
        const newPath = new URL(link.href).pathname
        
        // Only show progress if navigating to a different page
        if (currentPath !== newPath) {
          NProgress.start()
        }
      }
    }

    // Handle back/forward navigation
    const handlePopState = () => {
      NProgress.start()
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
      // Clean up style element
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  return null
}