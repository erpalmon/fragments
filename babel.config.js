// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      useBuiltIns: 'usage',
      corejs: 3,
      modules: 'auto',
    }],
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
    }],
  ],
};
