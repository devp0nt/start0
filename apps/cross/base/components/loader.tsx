import React from 'react'
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native'

const { height: screenHeight } = Dimensions.get('window')

export const Loader = ({ type = 'section' }: { type?: 'page' | 'section' | 'site' } = {}) => {
  switch (type) {
    case 'site':
      return (
        <View style={styles.siteContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
        </View>
      )
    case 'page':
      return (
        <View style={styles.pageContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
        </View>
      )
    case 'section':
      return (
        <View style={styles.sectionContainer}>
          <ActivityIndicator size="small" color="#1890ff" />
        </View>
      )
  }
}

const styles = StyleSheet.create({
  siteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: screenHeight,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  sectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
})
