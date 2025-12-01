import { useEffect } from 'react'
import { useRouter } from 'next/router'

declare global {
  interface Window {
    NProgress: any
  }
}

export default function useNavigationProgress() {
  useEffect(() => {
    // Create and inject NProgress styles
    const style = document.createElement('style')
    style.innerHTML = `
      /* NProgress Progress Bar Styles */
      #nprogress {
        pointer-events: none;
      }
      
      #nprogress .bar {
        background: #1890ff;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #1890ff, 0 0 5px #1890ff;
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `
    document.head.appendChild(style)

    // Simple progress bar implementation
    let progressBar: HTMLElement | null = null
    let isLoading = false

    const startProgress = () => {
      if (isLoading) return
      isLoading = true

      // Create progress bar
      progressBar = document.createElement('div')
      progressBar.id = 'nprogress'
      progressBar.innerHTML = '<div class="bar"><div class="peg"></div></div>'
      document.body.appendChild(progressBar)

      const bar = progressBar.querySelector('.bar') as HTMLElement
      if (bar) {
        bar.style.width = '0%'
        bar.style.transition = 'width 0.2s ease'
        
        // Animate to 30% quickly
        setTimeout(() => {
          bar.style.width = '30%'
        }, 10)
        
        // Slowly progress to 70%
        setTimeout(() => {
          bar.style.width = '70%'
          bar.style.transition = 'width 2s ease'
        }, 200)
      }
    }

    const finishProgress = () => {
      if (!isLoading || !progressBar) return
      
      const bar = progressBar.querySelector('.bar') as HTMLElement
      if (bar) {
        bar.style.transition = 'width 0.3s ease'
        bar.style.width = '100%'
        
        setTimeout(() => {
          if (progressBar) {
            progressBar.style.opacity = '0'
            progressBar.style.transition = 'opacity 0.2s ease'
            
            setTimeout(() => {
              if (progressBar && progressBar.parentNode) {
                progressBar.parentNode.removeChild(progressBar)
              }
              progressBar = null
              isLoading = false
            }, 200)
          }
        }, 100)
      }
    }

    // Override Link clicks to show progress
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        // Only show progress for internal navigation
        startProgress()
      }
    }

    // Listen for navigation events
    document.addEventListener('click', handleLinkClick)

    // Listen for page visibility changes (when navigation completes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(finishProgress, 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      startProgress()
      setTimeout(finishProgress, 500)
    }

    window.addEventListener('popstate', handlePopState)

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('popstate', handlePopState)
      
      if (progressBar && progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar)
      }
      
      if (style && style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])
}