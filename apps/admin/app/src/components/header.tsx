import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd'
import { useGetIdentity } from '@refinedev/core'
import { ProjectSelect } from '@admin/core/lib/project'
import { Layout as AntdLayout, Space, Switch, Typography, theme } from 'antd'
import React, { useContext } from 'react'
import { ColorModeContext } from '../lib/colorMode'

const { Text } = Typography
const { useToken } = theme

type IUser = {
  id: number
  name: string
  avatar: string
}

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({ sticky = true }) => {
  const { token } = useToken()
  const { data: user } = useGetIdentity<IUser>()
  const { mode, setMode } = useContext(ColorModeContext)

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgLayout,
    display: 'flex',
    justifyContent: 'space-between',
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
      <ProjectSelect />
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
          {user?.name && <Text strong>{user.name}</Text>}
        </Space>
      </Space>
    </AntdLayout.Header>
  )
}
