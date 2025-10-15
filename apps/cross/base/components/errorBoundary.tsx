import { ErrorPage } from '@cross/base/components/error'
import React from 'react'
import { type ErrorBoundaryProps } from 'expo-router'

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  // Log the error for debugging
  // TODO: add own entry point with boundary
  console.error('Uncaught React error:', error)

  return <ErrorPage error={error} onRetry={retry} />
}
