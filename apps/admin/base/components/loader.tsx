import { Flex, Spin } from 'antd'

export const Loader = ({ type = 'section' }: { type?: 'page' | 'section' | 'site' } = {}) => {
  switch (type) {
    case 'site':
      return (
        <Flex justify="center" align="center" style={{ width: '100%', height: '100vh' }}>
          <Spin size="large" />
        </Flex>
      )
    case 'page':
      return (
        <Flex justify="center" align="center" style={{ width: '100%', height: '100%' }}>
          <Spin size="large" />
        </Flex>
      )
    case 'section':
      return (
        <Flex justify="center" align="center" style={{ width: '100%' }}>
          <Spin size="default" />
        </Flex>
      )
  }
}
