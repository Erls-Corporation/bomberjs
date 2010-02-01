/* PROJECT CONFIGURATION FILE */

// Port to run node server on (default 8400)
// exports.port = 8400;

// A secret key to sign sessions, cookies, password etc. 
// Make sure you set this, and that you keep the secret -- well, secret
exports.signing_secret = "";

// Configuration for persistent storage for session and users
// (at the moment, only on-disk storage is available)
// Default: 'disk'
exports.persistent_storage_method = 'disk';

// For disk storage, this is the path a folder
// Default: '/tmp/'
exports.persistent_storage_location = './storage/';

// Minutes before sessions expire
// Default: 120
exports.session_expire_minutes = 120;

// Name of the cookie to use for session
// Default: 'session_key'
// exports.session_cookie_name = 'session_key';

