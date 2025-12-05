// babel.config.cjs
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '18' },
        modules: 'auto',
      },
    ],
  ],
  plugins: [['@babel/plugin-transform-runtime']],
};
