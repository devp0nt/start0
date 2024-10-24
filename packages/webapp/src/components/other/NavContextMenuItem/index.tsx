import type { iconsSources } from '@/webapp/src/lib/icons.js'
import { ContextMenuItem } from '@/webapp/src/lib/uninty.components.js'
import type { ContextMenuItemConfiguredPropsWithRef } from '@uinity/react-dom/dist/components/ContextMenuItem/configured.js'
import { useLocation } from 'react-router-dom'

export const NavContextMenuItem = (props: ContextMenuItemConfiguredPropsWithRef<'a', keyof typeof iconsSources>) => {
  const { pathname } = useLocation()
  const { href } = props
  const current = pathname === href
  return <ContextMenuItem {...(props as {})} current={current} />
}
