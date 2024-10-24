import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const AnchorClickListener = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement | null

      // Traverse up the DOM tree to find an <a> element
      while (target && target.tagName.toLowerCase() !== 'a') {
        target = target.parentElement
      }

      // Check if the clicked element is an <a> tag and command/control is not pressed
      if (
        target &&
        target.tagName.toLowerCase() === 'a' &&
        !event.metaKey && // command key on macOS
        !event.ctrlKey // control key on Windows/Linux
      ) {
        const href = target.getAttribute('href')
        if (!href || href.startsWith('http')) {
          return
        }
        event.preventDefault()
        if (href) {
          navigate(href)
        }
      }
    }

    document.body.addEventListener('click', handleClick)

    return () => {
      document.body.removeEventListener('click', handleClick)
    }
  }, [navigate])

  return null
}
