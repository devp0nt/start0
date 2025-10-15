module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // it default. Can be overrided
  }
}
