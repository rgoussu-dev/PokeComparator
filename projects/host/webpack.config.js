const path = require('path');
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});

module.exports.resolve = module.exports.resolve || {};
module.exports.resolve.alias = Object.assign(module.exports.resolve.alias || {}, {
  '@ui': path.resolve(__dirname, '../../ui/src')
});
