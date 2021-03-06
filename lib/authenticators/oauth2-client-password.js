/**
 * Created by eugenia on 17.12.16.
 */

'use strict';

const Authenticator = require('./authenticator');
/**
 * Client Authenticator.
 * @constructor
 * @param {object} options  - Options. Optional
 * @param {boolean} options.passReqToCallback
 * @param {function} verify - Function for client credentials verification
 */
class ClientAuthenticator extends Authenticator {
  constructor(options, verify) {
    if (typeof options === 'function') {
      verify = options;
      options = {};
    }

    super({
      verify,
      name: Authenticator.AUTH_TYPE.CLIENT,
    });

    this.passReqToCallback = options.passReqToCallback;
  }

  /**
   * Authenticate
   * Extracts client credentials from body. Writes client model to req[options.userProperty]
   * @function
   * @param {object} req - incoming message
   */
  authenticate(req) {
    const { oauthdoneScope } = req;
    if (!req.body || (!req.body.client_id || !req.body.client_secret)) {
      return oauthdoneScope.fail(400, 'No client credentials provided');
    }

    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret || false;

    function callback(err, client, info) {
      if (err) {
        return oauthdoneScope.error(err);
      }

      if (!client) {
        return oauthdoneScope.fail(401, 'Unauthorized');
      }

      oauthdoneScope.logIn(client, info);
    }

    if (this.passReqToCallback) {
      return this.verify(req, clientId, clientSecret, callback.bind(this));
    } else {
      return this.verify(clientId, clientSecret, callback.bind(this));
    }
  }
}

module.exports = ClientAuthenticator;
