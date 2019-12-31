const packageJson = require('./package.json');

module.exports = {
  APP_NAME: packageJson.name,
  APP_VERSION: packageJson.version,
  IS_SERVER: true,
};
