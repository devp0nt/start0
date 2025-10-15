import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { ErrorPage } from '@cross/base/components/error'
import { useColorScheme } from '@cross/base/hooks/use-color-scheme'
import { TrpcReactQueryProvider } from '@trpc/client-base'

// TODO: figure out what is it
export const unstable_settings = {
  anchor: '(tabs)',
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  console.error('Uncaught React error:', error)
  return <ErrorPage error={error} onRetry={retry} />
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <TrpcReactQueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="[...rest]" options={{ headerShown: true }} key={document.location.href} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TrpcReactQueryProvider>
  )
}
