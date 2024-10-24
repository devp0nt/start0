import type { iconsSources } from '@/webapp/src/lib/icons.js'
import { Link } from '@/webapp/src/lib/uninty.components.js'
import type { LinkConfiguredPropsWithRef } from '@uinity/react-dom/dist/components/Link/configured.js'
import { useLocation } from 'react-router-dom'

export const NavLink = (props: LinkConfiguredPropsWithRef<'a', keyof typeof iconsSources>) => {
  const { pathname } = useLocation()
  const { href } = props
  const current = pathname === href
  const s = { lineHeight: 1.2 }
  return (
    <Link
      {...(props as {})}
      $style={{ rest: s, active: s, current: s, disabled: s, focus: s, hover: s }}
      current={current}
    />
  )
}
