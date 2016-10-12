
'use strict';

var responseBuilder = require('./responseBuilder');

var handler = (function() {
  

	function handle(req, res, next) {

		// if res.locals.status is not set then assume no branch processed the request
		// and we have a NOT FOUND condition
		// and don't build json Response envelope
		
		// set response status
		res.status(res.locals.status || 404);

		// if status 2xx, renew expiration of token
		/*
		if (res.locals.status >= 200 && res.locals.status < 400) {
			// refresh the token EXCEPT if invalid or has an 'action' claim, which means it's a special token
			if (res.locals.tokenValid && !res.locals.tokenPayload.action) {
				var newToken = AuthCtrl.refresh(res.locals.tokenPayload);
				if (newToken) {
					res.header('x-md-token', newToken);
				}
			}
		}
		*/
		
		
		// handle redirect
		if (res.locals.redirect_uri) {

			console.log('Sending Redirect to: ' + res.locals.redirect_uri);
			res.redirect(res.locals.status, res.locals.redirect_uri);

		} else {
			// direct response
			// build envelope
			if (res.locals.status) {
				res.json(responseBuilder.build(res));
			} else {
				res.send('404 - Not Found');
			}
		}
	}

	
	return {
		handle: handle
	};

}());

module.exports = handler;