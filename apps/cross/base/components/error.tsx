import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

export const ErrorPage = ({ error, message, onRetry }: { error?: unknown; message?: string; onRetry?: () => void }) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry()
    } else {
      // For React Native, we might want to trigger a navigation reset or app restart
      // This is a placeholder - actual implementation depends on navigation setup
      console.log('Reload requested')
    }
  }

  const errorMessage =
    message ||
    (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Unknown error')

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>An unexpected error occurred while rendering this page.</Text>

        <TouchableOpacity style={styles.button} onPress={handleReload}>
          <Text style={styles.buttonText}>Reload Page</Text>
        </TouchableOpacity>

        {!!error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorDetailsTitle}>Error Details</Text>
            <View style={styles.errorAlert}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    width: '100%',
    marginTop: 16,
  },
  errorDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorAlert: {
    backgroundColor: '#fff2f0',
    borderColor: '#ffccc7',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  errorMessage: {
    color: '#ff4d4f',
    fontSize: 14,
    lineHeight: 20,
  },
})
