oauthdone
===========

`oauthdone` is connects `passport` with `oauth2orize`.

The core objective is to bring simplicity without storing any dependencies or stats.

The steps of integration
===

1. Implement your delegate with the following structure:
```js
function AuthDelegate() {
}

util.inherits(AuthDelegate, Object);

/**
 * Get user object by login and password
 * @param login
 * @param password
 * @param callback receives user model if found, false - if not found
 */
AuthDelegate.prototype.findUserByLoginAndPassword = function(login, password, callback) {
  return callback(null, {login: "login"});
};

/**
 * Get client object by id and secret
 * @param clientId
 * @param clientSecret
 * @param callback client model if found, false - if not found
 */
AuthDelegate.prototype.findClientByIdAndSecret = function(clientId, clientSecret, callback) {
  return callback(null, {clientId: clientId, clientSecret: clientSecret});
};

/**
 * Get user object by token
 * @param token
 * @param callback receives object containing user model as `obj` and additional `info` object if found, false - if not found
 */
AuthDelegate.prototype.findUserByAccessToken = function(token, callback) {
  return callback(null, {obj: {login: "login"}, info: {}});
};

/**
 * Get user object by refreshToken
 * @param token
 * @param callback receives user model if found, false - if not found
 */
AuthDelegate.prototype.findUserByRefreshToken = function(token, callback) {
  return callback(null, {login: "login"});
};

/**
 * Clean up tokens for user and client
 * @param user
 * @param client
 * @param callback receives no params
 */
AuthDelegate.prototype.cleanUpTokensByUserAndClient = function(user, client, callback) {
  callback();
};

/**
 * Create tokens for user and client
 * @param user
 * @param client
 * @param scope
 * @param tokenValue
 * @param refreshTokenValue
 * @param callback receives no params
 */
AuthDelegate.prototype.createTokensByUserAndClient = function (user, client, scope, tokenValue, refreshTokenValue, callback) {
  callback();
};

/**
 * Get additional token info.
 * @param context object, containing client, scope, tokenValue, refreshTokenValue, user
 * @returns {Object} an arbitrary object
 */
AuthDelegate.prototype.getTokenInfo = function (context) {
  return {};
};

/**
 * Generate token value string.
 * @returns {Object} tokenValue
 */
AuthDelegate.prototype.generateTokenValue = function () {
  return 'xxx';
};

```
2. Initialize `OAuthdone`

```js
var OAuthdone = require('oauthdone');
app.use(OAuthdone.passport.initialize()); //  we assume you use `express`
var oAuth2 = new OAuthdone(new AuthDelegate()); // replace `AuthDelegate` with your delegate
```

3. Add a route for authentication

```js
app.route('/oauth')
  .post(oAuth2.getToken())  //  we assume you use `express` v4.x
;
```

4. Add auth "gates" in every route you need:

```js
var passport = require('oauthdone').passport;

router.get('/',
  passport.authenticate('bearer', { session: false }),
  function (req, res) {
    res.send('respond with a resource');
  }
);
```

That's all.

How to test it
===

> I use `httpie` (https://github.com/jakubroztocil/httpie) as a command line tool to test the servers. You can use any, but all the examples are created with syntax of `httpie`. Anyway it's recognizable.

1. Try to get secured resource (`users` in my case):

```
$ http localhost:3000/users

HTTP/1.1 401 Unauthorized
Connection: keep-alive
Date: Fri, 22 Aug 2014 05:43:32 GMT
Transfer-Encoding: chunked
WWW-Authenticate: Bearer realm="Users"
X-Powered-By: Express

Unauthorized
```

2. Authenticate:

```
$ http POST localhost:3000/oauth grant_type=password client_id=app client_secret=secret username=login password=password

HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Type: application/json
Date: Fri, 22 Aug 2014 05:46:08 GMT
Pragma: no-cache
Transfer-Encoding: chunked
X-Powered-By: Express

{
    "access_token": "xxx", 
    "refresh_token": "xxx", 
    "token_type": "bearer"
}
```

3. Try to get secured resource (`users` in my case) with token:

```
$ http localhost:3000/users Authorization:'Bearer xxx'

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 23
Content-Type: text/html; charset=utf-8
Date: Fri, 22 Aug 2014 05:50:03 GMT
ETag: "-985940870"
X-Powered-By: Express

respond with a resource
```

License
==

MIT License. Copyright (c) 2014 Melvyn kim.
