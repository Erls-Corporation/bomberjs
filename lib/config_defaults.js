exports.defaults = {
  server: {
    port: 8400
  },
  security: {
    signing_secret: ""
  },
  persistent_storage: {
    method: 'disk',
    options: {
      location: '/tmp/'
    }
  },
  session: {
    expire_minutes: 60,
    renew_minutes: 6,
    cookie: {
      name: 'session_key',
      domain: '',
      path: '/',
      secure: false
    }
  }
};
