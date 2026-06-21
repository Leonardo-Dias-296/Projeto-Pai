module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@autocontrol/shared': '../../packages/shared/src/index.ts',
          },
        },
      ],
    ],
  };
};
