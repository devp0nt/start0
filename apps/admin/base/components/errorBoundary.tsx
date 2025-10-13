import { ErrorPage } from '@admin/base/components/error'
import type { ReactNode } from 'react'
import React from 'react'

interface ErrorBoundaryProps {
  children?: ReactNode
  error?: unknown
}

interface ErrorBoundaryState {
  hasError: boolean
  error: unknown
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: !!props.error, error: props.error ?? null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Uncaught React error:', error, info)
    // You could send the error to an external service here
  }

  render(): ReactNode {
    const { hasError, error } = this.state

    if (hasError) {
      return <ErrorPage error={error} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
