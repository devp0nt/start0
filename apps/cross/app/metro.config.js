// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const nodePath = require('path')
const appsDir = nodePath.resolve(__dirname, '../../')
const modulesDir = nodePath.resolve(__dirname, '../../../modules')
config.watchFolders = [...config.watchFolders, appsDir, modulesDir]

module.exports = config
