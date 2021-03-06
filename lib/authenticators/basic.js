/**
 * Created by eugenia on 17.12.16.
 */

'use strict';

const Authenticator = require('./authenticator');

/**
 * Basic Authenticator.
 * @constructor
 * @param {object} options - Options. Optional
 * @param {boolean} options.passReqToCallback
 * @param {function} verify - Function for client credentials verification
 */

class BasicAuthenticator extends Authenticator {
  constructor(options, verify) {
    if (typeof options === 'function') {
      verify = options;
      options = {};
    }
    super({
      verify,
      name: Authenticator.AUTH_TYPE.BASIC,
    });

    this.passReqToCallback = options.passReqToCallback;
  }

  /**
   * Authenticate
   * Extracts client credentials from Authorization header.
   * Writes client model to req[options.userProperty]
   * @function
   * @param {object} req - incoming message
   */
  authenticate(req) {
    req = req.req || req;
    const { oauthdoneScope } = req;

    let auth = req.headers.authorization;
    if (!auth) {
      return oauthdoneScope.fail();
    }

    const parts = auth.split(' ');
    if ((parts[0].toLowerCase() !== 'basic') || !parts[1]) {
      return oauthdoneScope.fail(400, 'Invalid token provided');
    }

    [, auth] = parts;

    auth = Buffer.from(auth, 'base64').toString();
    auth = auth.match(/^([^:]*):(.*)$/);
    if (!auth) {
      return oauthdoneScope.fail(400, 'Invalid token provided');
    }

    function callback(err, user) {
      if (err) {
        return oauthdoneScope.error(err);
      }

      if (!user) {
        return oauthdoneScope.fail(401, 'Unauthorized');
      }

      oauthdoneScope.logIn(user);
    }

    if (this.passReqToCallback) {
      return this.verify(req, auth[1], auth[2], callback.bind(this));
    } else {
      return this.verify(auth[1], auth[2], callback.bind(this));
    }
  }
}

module.exports = BasicAuthenticator;
