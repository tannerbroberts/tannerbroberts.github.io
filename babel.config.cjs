module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['>0.25%', 'not dead', 'ie 11'],
        node: 'current'
      }
    }],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-transform-runtime', // Helps with reusing Babel's injected helper code to save on codesize
    '@babel/plugin-proposal-class-properties', // Allows class properties syntax
    '@babel/plugin-transform-object-rest-spread' // Allows object rest/spread syntax
  ]
};