var Session = require('./session').Session;

/* SessionStore()
 *
 */

Session.prototype._MAX_SESSION_KEY = Math.pow(2,63);

var SessionStore = exports.SessionStore = function(server) {
  this._sessions = {};
  this._server = server;
  this._session_cookie_name = server.options.session_cookie_name || 'session_key';
};

SessionStore.prototype._getNewSessionKey = function() {
  do {
    // TODO: Use signature of stuff and secret key: hmac(secret_key, rnd+pid+date)
    var session_key = Math.floor(Math.random()*this._MAX_SESSION_KEY);
  } while( this._sessions[session_key] );
  return( session_key );
}

SessionStore.prototype._getSessionKey = function(request, response) {
  var session_key = request.cookies.getSecure(this._session_cookie_name, "");
  if ( session_key === "" ) {
    session_key = this._getNewSessionKey();
    // TODO: Set path, expires, etc from constants
    response.cookies.setSecure( this._session_cookie_name, session_key );
  }
  return( session_key );
}
  
SessionStore.prototype.getCurrentSession = function(request, response) {
  var session_key = this._getSessionKey(request, response);
  if ( !this._sessions[session_key] )  
    this._sessions[session_key] = new Session();
  
  return( this._sessions[session_key] );
}
    
