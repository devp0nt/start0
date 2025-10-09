import React from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from '@admin/app/lib/errorBoundary'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}
const root = createRoot(container)

try {
  const { default: App } = await import('./App')

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  root.render(
    <React.StrictMode>
      <ErrorBoundary error={error} />
    </React.StrictMode>,
  )
}
