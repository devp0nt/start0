import { layoutStorik } from '@/webapp/src/components/layout/store.js'
import { NavLink } from '@/webapp/src/components/other/NavLink/index.js'
import { useAppContext } from '@/webapp/src/lib/ctx.js'
import {
  adminAccountRoute,
  adminActionLogsRoute,
  adminAdminListRoute,
  adminSignInRoute,
  adminSignOutRoute,
  adminUserListRoute,
  homeRoute,
  userAccountRoute,
  userProjectListRoute,
  userSignInRoute,
  userSignOutRoute,
  userSubscriptionRoute,
} from '@/webapp/src/lib/routes.js'
import { Block, ControlIcon, Disabler, Layout, Text } from '@/webapp/src/lib/uninty.components.js'
import { useWindowSize } from '@/webapp/src/lib/windowSize.js'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const Menu = () => {
  const { me } = useAppContext()
  return (
    <Block fcnw afs>
      <Block fcnw mb={20}>
        <Block fcnw g={10} afs>
          <NavLink variant="body-l" href={homeRoute.get()}>
            Home page
          </NavLink>
          {!me.user && (
            <NavLink variant="body-l" href={userSignInRoute.get()}>
              Sign in as user
            </NavLink>
          )}
          {!me.admin && (
            <NavLink variant="body-l" href={adminSignInRoute.get()}>
              Sign in as admin
            </NavLink>
          )}
        </Block>
      </Block>
      {me.user && (
        <Block fcnw mb={20} g={4}>
          <Text variant="body-s" color="tertiary" weight="bold">
            User Section
          </Text>
          <Block fcnw g={10} afs>
            <>
              <NavLink variant="body-l" href={userProjectListRoute.get()}>
                Projects
              </NavLink>
              <NavLink variant="body-l" href={userSubscriptionRoute.get()}>
                Subscription
              </NavLink>
              <NavLink variant="body-l" href={userAccountRoute.get()}>
                Account
              </NavLink>
              <NavLink variant="body-l" href={userSignOutRoute.get()}>
                Logout
              </NavLink>
            </>
          </Block>
        </Block>
      )}
      {me.admin && (
        <Block fcnw mb={20} g={4}>
          <Text variant="body-s" color="tertiary" weight="bold">
            Admin Section
          </Text>
          <Block fcnw g={10} afs>
            <NavLink variant="body-l" href={adminUserListRoute.get()}>
              Users
            </NavLink>
            <NavLink variant="body-l" href={adminAdminListRoute.get()}>
              Admins
            </NavLink>
            <NavLink variant="body-l" href={adminAccountRoute.get()}>
              Account
            </NavLink>
            <NavLink variant="body-l" href={adminActionLogsRoute.get()}>
              Logs
            </NavLink>
            <NavLink variant="body-l" href={adminSignOutRoute.get()}>
              Logout
            </NavLink>
          </Block>
        </Block>
      )}
    </Block>
  )
}

export const GeneralLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation()
  const { loading, modalOpened } = layoutStorik.useStore()
  const { width: windowWidth } = useWindowSize()
  const isMobile = windowWidth < 1_000
  useEffect(() => {
    if (modalOpened) {
      layoutStorik.updateStore({ modalOpened: false })
    }
  }, [pathname])
  return (
    <>
      <Layout
        $style={{
          headerFixed: true,
          sidebarFixed: true,
        }}
        // modalOpened={modalOpened}
        headerRender={
          <Block frnw ac hf jsb>
            <Text variant="heading-m">Svagatron</Text>
            {isMobile && (
              <ControlIcon
                name={modalOpened ? 'closeTimes' : 'menuBurger'}
                onClick={() => {
                  layoutStorik.updateStore({ modalOpened: !modalOpened })
                }}
              />
            )}
          </Block>
        }
        sidebarRender={
          isMobile ? null : (
            <>
              <Menu />
              <br />
              <br />
            </>
          )
        }
        // modalRender={<Menu />}
      >
        <Disabler
          disabled={loading}
          style={{
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            flex: '1 1 100%',
            width: '100%',
          }}
        >
          <div
            style={{
              display: isMobile && modalOpened ? 'flex' : 'none',
              flexFlow: 'column nowrap',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              flex: '1 1 100%',
              width: '100%',
            }}
          >
            <Menu />
          </div>
          <div
            style={{
              display: isMobile && modalOpened ? 'none' : 'flex',
              flexFlow: 'column nowrap',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              flex: '1 1 100%',
              width: '100%',
            }}
          >
            {children}
          </div>
        </Disabler>
      </Layout>
    </>
  )
}
