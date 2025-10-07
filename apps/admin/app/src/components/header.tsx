import { honoAppClient, honoAppClient2 } from '@admin/core/lib/hono'
import { useTrpc } from '@admin/core/lib/trpc'
import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd'
import { useGetIdentity } from '@refinedev/core'
import { useQuery } from '@tanstack/react-query'
import { Layout as AntdLayout, Space, Switch, Typography, theme } from 'antd'
import React, { useContext, useEffect } from 'react'
import { ColorModeContext } from '../lib/colorMode'
import { useHonoQuery } from '@admin/core/lib/hono1'

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

  // const x = useHonoQuery(honoAppClient.ping, '$get', {})
  // const y = useHonoQuery(honoAppClient.hello, '$get', { query: { name: 'oop' } })
  // const zz = useHonoQuery(honoAppClient.big.ping, '$get', { query: { name: 'oop' } })

  console.log(444, honoAppClient2.ping.$get.queryOptions({}))
  const x = useQuery(honoAppClient2.ping.$get.queryOptions({}))
  const y = useQuery(honoAppClient2.hello.$get.queryOptions({ query: { name: 'oop' } }))
  const z = useQuery(honoAppClient2.big.ping.$get.queryOptions({}))
  const trpc = useTrpc()
  const config = useQuery(trpc.app.getConfig.queryOptions())
  console.log(21, x.data)
  console.log(22, y.data)
  console.log(23, z.data)
  // console.log(89988, config.data)

  // useEffect(() => {
  //   void (async () => {
  //     try {
  //       const result = await honoAppClient.hello.$get({ query: { name: 'zxc' } })
  //       const data = await result.json()
  //       console.log(123, data)
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   })()
  // }, [])

  useEffect(() => {
    void (async () => {
      try {
        const result = await honoAppClient2.ping.$get()
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
