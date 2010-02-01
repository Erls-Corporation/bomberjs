/* Session()
 *
 */


var Session = exports.Session = function() {
  this.reset();
};


Session.prototype.get = function(name, default_value) {
  if ( this._data[name] && this._data[name]['value'] ) {
    return( this._data[name]['value'] );
  } else {
    return( default_value || "" );
  }
}

Session.prototype.set = function(name, value) {
  // TODO: Expires
  this._data[name] = {value: value}
  require('sys').p(this);
}

Session.prototype.unset = function(name) {
  delete this._data[name];
}

Session.prototype.reset = function() {
  this._data = {};
}
