// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const nodePath = require('path')
const appsDir = nodePath.resolve(__dirname, '../../')
const modulesDir = nodePath.resolve(__dirname, '../../../modules')
const packagesDir = nodePath.resolve(__dirname, '../../../packages')
config.watchFolders = [...config.watchFolders, appsDir, modulesDir, packagesDir]
config.server.port = +process.env.PORT

module.exports = config
