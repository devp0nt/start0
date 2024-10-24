import css from './index.module.scss'
import cn from 'classnames'
import React from 'react'

export const RichText: React.FC<{
  children?: React.ReactNode
  html?: string | null
  className?: string
  style?: Record<string, any>
  limitedWidth?: boolean
  smaller?: boolean
}> = ({ children, html, className, limitedWidth = false, smaller = false, ...restProps }) => {
  const classNameHere = cn({
    [css.richText]: true,
    [className || '']: className,
    [css.limitedWidth]: limitedWidth,
    [css.smaller]: !!smaller,
  })

  if (html) {
    return <div className={classNameHere} dangerouslySetInnerHTML={{ __html: html }} />
  }
  return (
    <div className={classNameHere} {...restProps}>
      {children}
    </div>
  )
}
