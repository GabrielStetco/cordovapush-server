var config = {
  cert: 'push.pem',                 /* Certificate file path */
  certData: null,                   /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
  key:  'pushkey.pem',                  /* Key file path */
  keyData: null,                    /* String or Buffer containing key data, as certData */
  passphrase: '***',                 /* A passphrase for the Key file */
  ca: null,                          /* String or Buffer of CA data to use for the TLS connection */
  gateway: 'gateway.sandbox.push.apple.com',/* gateway address (gateway.push.apple.com for production)*/
  port: 2195,                       /* gateway port */
  enhanced: true,                   /* enable enhanced format */
  errorCallback: undefined,         /* Callback when error occurs function(err,notification) */
  cacheLength: 100,                  /* Number of notifications to cache for error purposes */
  lport: 8121
};
module.exports = config;
