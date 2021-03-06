/*!
 * node-recaptcha
 * Copyright(c) 2010 Michael Hampton <mirhampt+github@gmail.com>
 * MIT Licensed
 */

var http = require('http')
  , querystring = require('querystring')

  , API_HOST = 'www.google.com'
  , API_END_POINT = '/recaptcha/api/verify'
  , SCRIPT_SRC    = API_HOST + '/recaptcha/api/challenge'
  , NOSCRIPT_SRC  = API_HOST + '/recaptcha/api/noscript'

  , Recaptcha = module.exports.Recaptcha = function Recaptcha(
      public_key, private_key, data, secure) {
        this.public_key = public_key;
        this.private_key = private_key;

        if (typeof(data) === 'boolean') {
          this.data = undefined;
          this.is_secure = data;
        } else {
          this.data = data;
          this.is_secure = secure;
        }

        return this;
    };

Recaptcha.prototype.toHTML = function() {
  var query_string = 'k=' + this.public_key;

  if (this.error_code) {
    query_string += '&error=' + this.error_code;
  }

  var script_src = (this.is_secure ? "https://" : "http://")
      + SCRIPT_SRC + '?' + query_string
    , noscript_src = (this.is_secure ? "https://" : "http://")
      + NOSCRIPT_SRC + '?' + query_string;

  return '<script src="' + script_src + '"></script>'
    + '<noscript><iframe src="' + noscript_src + '" height="300" width="500" '
    + 'frameborder="0"></iframe><br><textarea name="recaptcha_challenge_field" '
    + 'rows="3" cols="40"></textarea><input type="hidden" '
    + 'name="recaptcha_response_field" value="manual_challenge"></noscript>';
};


Recaptcha.prototype.verify = function(callback) {
  var self = this;

  if (typeof(this.data) === 'undefined') {
    this.error_code = 'verify-params-incorrect';
    return callback(false, 'verify-params-incorrect');
  }

  if (!('remoteip' in this.data
    && 'challenge' in this.data
    && 'response' in this.data)) {
    this.error_code = 'verify-params-incorrect';
    return callback(false, 'verify-params-incorrect');
  }

  if (this.data.response === '') {
    this.error_code = 'incorrect-captcha-sol';
    return callback(false, 'incorrect-captcha-sol');
  }

  this.data.privatekey = this.private_key;

  var data_qs = querystring.stringify(this.data)
    , recaptcha = http.createClient(80, API_HOST)
    , request = recaptcha.request('POST', API_END_POINT, {
      host:             API_HOST,
      'Content-Length': data_qs.length,
      'Content-Type':   'application/x-www-form-urlencoded'
    });

  request.on('response', function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      var success, error_code
        , parts = body.split('\n');

      success = parts[0];
      error_code = parts[1];
      if (success !== 'true') {
        self.error_code = error_code;
      }
      return callback(success === 'true', error_code);
    });
  });

  request.write(data_qs, 'utf8');
  request.end();
};
