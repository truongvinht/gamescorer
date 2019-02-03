// configHandler.js
// Wrapper/Handle db request to mySQL
// ==================

//load settings => auto fallback to example for heroku
var botSettings = {};
const exampleSettings = require("../../templates/default_settings.json");

try {
    botSettings = require("../../defaults/settings.json");
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    }
    console.log('Warning: /defaults/settings.json not found. Loading default default_settings.json...');
    botSettings = exampleSettings;
}



// Get application version
const getVersion = () => {
    return exampleSettings.version;
}

/**
 * Database connection data: host, user, password, database
 */
const getDbSettings = () => {
    return {host:botSettings.host,
            user:botSettings.user,
            password: botSettings.password,
            database: botSettings.database};
}

// export
module.exports = {
    version: getVersion,
    dbSettings: getDbSettings
  };