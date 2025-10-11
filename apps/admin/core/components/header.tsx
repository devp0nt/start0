import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd'
import { Layout as AntdLayout, Space, Switch, theme } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router'
import { ColorModeContext } from '@admin/core/components/colorMode'
import { useRefineGetIdentity } from '@auth/admin/refine'

const { useToken } = theme

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({ sticky = true }) => {
  const { token } = useToken()
  const { data: admin } = useRefineGetIdentity()
  const { mode, setMode } = useContext(ColorModeContext)

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgLayout,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px 24px',
    height: '64px',
    borderBottom: `1px solid ${token.colorBorder}`,
  }

  if (sticky) {
    headerStyles.position = 'sticky'
    headerStyles.top = 0
    headerStyles.zIndex = 1
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => {
            setMode(mode === 'light' ? 'dark' : 'light')
          }}
          defaultChecked={mode === 'dark'}
        />
        <Space style={{ marginLeft: '8px' }} size="middle">
          {admin && (
            <Link
              to="/profile"
              style={{
                color: token.colorLink,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {admin.name || admin.email}
            </Link>
          )}
        </Space>
      </Space>
    </AntdLayout.Header>
  )
}
