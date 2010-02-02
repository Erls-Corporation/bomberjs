var Session = require('./session').Session
    sha1 = require('./sha1');

/* SessionStore(server)
 *
 * An in-memory object for storing session data. 
 * 
 * This should be initialized when the server starts up, and will
 * maintain the creation, renewal and expiration of sessions.
 *
 * Parameters:
 *
 * + `server`: A `Server` instance.
 */
var SessionStore = exports.SessionStore = function(server) {
  this._sessions = {};
  this._server = server;
};


SessionStore.prototype._MAX_SESSION_KEY = Math.pow(2,63);

/* SessionStore.prototype.getCurrentSession = function(request, server)
 *
 * Get a session for the current request. 
 *
 * Tries to return `Session` object from memory, otherwise a new session is created
 * and stored for returning on the next request.
 *
 * Parameters:
 *
 * + `request`: A `Request` instance.
 * + `response`: A `Response` instance.
 *
 * Returns:
 *
 * Either an existing or a new Session() object depending on the context.
 */
SessionStore.prototype.getCurrentSession = function(request, server) {  
  // Get the session_key from cookies or generate a new one
  var session_key = request.cookies.getSecure( this._server.options.session_cookie_name );
  if ( !session_key ) {
    var write_session_cookie = true;
    session_key = this._generateNewSessionKey();
  } else {
    var write_session_cookie = false;
  }

  // If the session object doesn't exist in memory, we'll create one.
  // This will magically be loaded from persistent storage is the session_key
  // identifies an ongoing session.
  if ( !this._sessions[session_key] )  {
    this._sessions[session_key] = new Session(session_key, request, server, write_session_cookie);
  }

  // Every once in a while, we'll want to renew the cookie identifying the session.
  // The frequency of this action is set by the value of session_renew_minutes in config.
  this._sessions[session_key].possiblyRenewSessionCookie();
  
  return( this._sessions[session_key] );
}

/* SessionStore.prototype._generateNewSessionKey = function()
 *
 * Create a new session_key. Basically as hash of a very random string.
 */
SessionStore.prototype._generateNewSessionKey = function() {
  do {
    // Generate a strategically random string
    var rnd = [Math.random()*this._MAX_SESSION_KEY, +new Date, process.pid].join('|');
    // And create a hash from it to use for a session key
    var session_key = sha1.hex_hmac_sha1( rnd, this._server.options.signing_secret );
  } while( this._sessions[session_key] );

  return( session_key );
}

  
    
