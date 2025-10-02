import { honoAppClient } from '@admin/core/lib/hono'
import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd'
import { useGetIdentity } from '@refinedev/core'
import { Layout as AntdLayout, Space, Switch, Typography, theme } from 'antd'
import React, { useContext, useEffect } from 'react'
import { ColorModeContext } from '../lib/colorMode'
import { useQuery } from '@admin/core/lib/honoq1'

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

  const x = useQuery(honoAppClient.ping, '$get', {})
  const y = useQuery(honoAppClient.hello, '$get', { query: { name: 'oop' } })
  const z = useQuery(honoAppClient.big.ping, '$get', { query: { name: 'oop' } })
  console.log(2, x.data)
  console.log(2, y.data)
  console.log(2, z.data)

  useEffect(() => {
    void (async () => {
      try {
        const result = await honoAppClient.hello.$get({ query: { name: 'zxc' } })
        const data = await result.json()
        console.log(123, data)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const result = await honoAppClient.ping.$get()
        const data = await result.json()
        console.log(234, data)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

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
