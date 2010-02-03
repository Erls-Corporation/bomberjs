/* Session(session_key, request, server, write_session_cookie)
 *
 * Interact with session variables.
 *
 * Parameters:
 *
 * + `session_key`: The key for this session
 * + `request`: A `Request` instance.
 * + `server`: A `Server` instance.
 * + `write_session_cookie`: Whether or not to write the session cookie to the request
 */
var Session = exports.Session = function(session_key, request, server, write_session_cookie) {
  // Remember arguments
  this.session_key = session_key;
  this._request = request;
  this._server = server;
  // Some state variables
  this._modified = false;

  // Try loading session data from storage
  try {
    // Note that we wait()ing for the data to return, since we need session immediately available
    this._data = this._server.store.get('bomber-sessions', this.session_key).wait();
  } catch(e) {
    // If the data doesn't exist, we'll start with an empty slate
    this.reset();
    write_session_cookie = true;
  }

  if ( !('__expires' in this._data) || this._data['__expires']<(+new Date()) ) {
    // Session has expired, reset and begin again
    this.reset();
    write_session_cookie = true;
  }

  // If this is a new session or is the cookie needs renewal, write the session cookie
  if ( write_session_cookie ) {
    this.writeSessionCookie();
  }
};

/* Session.prototype.set = function(name, value)
 *
 * Set a session variable
 *
 * Parameters:
 *
 * + `name`: The name of the session variable to set.
 * + `value`: The value of the session variable
 */
Session.prototype.set = function(name, value) {
  this._modified = true;
  this._data[name] = value
}

/* Session.prototype.get = function(name)
 *
 * Get the value of a session variable
 *
 * Parameters:
 *
 * + `name`: The name of the session variable to retreieve.
 * + `default_value`: A fallback value of the variable doesn't exist.
 *
 * Returns:
 *
 * The value of the session variable
 */
Session.prototype.get = function(name, default_value) {
  return( this._data[name] || default_value || "" );
}

/* Session.prototype.unset = function(name)
 *
 * Clear or delete an existing session vairable.
 *
 * Parameters:
 *
 * + `name`: The name of the session variable to clear.
 */
Session.prototype.unset = function(name) {
  this._modified = true;
  delete this._data[name];
}

/* Session.prototype.reset = function(name)
 *
 * Reset the session by clearing all data
 * The session_key stays the same even after the session has been reset.
 *
 */
Session.prototype.reset = function() {
  this._modified = true;
  this._data = {
    __created: (+new Date),
    __renew: (+new Date( +new Date + (this._server.options.session.renew_minutes*60*1000) )),
    __expires: (+new Date( +new Date + (this._server.options.session.expire_minutes*60*1000) ))
  }
}

/* Session.prototype.exists = function(name)
 *
 * Check if a certain session variable has been set or not.
 * 
 * Returns:
 *
 * True if the variable has been set. False otherwise.
 */
Session.prototype.exists = function(name) {
  return ( name in this._data );
}

/* Session.prototype.keys = function(name)
 *
 * Retrieve a list of all set sessions var.
 *
 * Returns:
 *
 * An `Array` of sesison variable names.
 */
Session.prototype.keys = function() {
  var keys = [];
  for ( key in this._data ) {
    if ( !(this._data[key] instanceof Function) && key.substr(0,2) !== "__" ) {
      keys.push(key);
    }
  }
  return( keys );
}

/* Session.prototype.save = function(name)
 *
 * Save the session object to persistent storage if the object has been modified.
 */
Session.prototype.save = function() {
  if ( this._modified ) {
    this._server.store.set('bomber-sessions', this.session_key, this._data);
  }
}

/* Session.prototype.possiblyRenewSessionCookie = function()
 *
 * Rewrite the session cookie if it is due for renewal.
 */
Session.prototype.possiblyRenewSessionCookie = function() {
  if ( ('__renew' in this._data) && this._data['__renew']<(+new Date()) ) {
    this._data['__renew'] = (+new Date( +new Date + (this._server.options.session.renew_minutes*60*1000) ));
    this._data['__expires'] = (+new Date( +new Date + (this._server.options.session.expire_minutes*60*1000) ));
    this._modified = true;
    this.writeSessionCookie();
  }
}

/* Session.prototype.writeSessionCookie = function()
 *
 * Write the session cookie to the current request connection, 
 * including domain/path/secure from project configuration and 
 * expires from the session timeout.
 */
Session.prototype.writeSessionCookie = function() {
  var _o = this._server.options.session.cookie;
  var cookie_opts = {
    expires: new Date(this._data['__expires']),
    domain: _o.domain,
    path: _o.path,
    secure: _o.secure
  };
  this._request.cookies.setSecure( _o.name, this.session_key, cookie_opts );
}
