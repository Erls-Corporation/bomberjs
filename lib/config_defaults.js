exports.defaults = {
  port: 8400,
  signing_secret: "",
  persistent_storage_method: 'disk',
  persistent_storage_location: '/tmp/',
  session_expire_minutes: 60,
  session_renew_minutes: 6,
  session_cookie_name: 'session_key',
  session_cookie_domain: '',
  session_cookie_path: '/',
  session_cookie_secure: false
};
