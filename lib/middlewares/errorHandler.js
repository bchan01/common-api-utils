
'use strict';

var responseBuilder = require('./responseBuilder');

var handler = (function() {
  
	function handle( err, req, res, next) {
		// set status
		res.status(res.locals.status || err.status || 500);

		res.locals.message = res.locals.message || err.message || 'Express.App catching: Internal Server error';
		if( res.locals.errors.length == 0 ) {
			res.locals.errors.push(err);
		}
		
		
		// build envelope
		res.json(responseBuilder.build(res));
	}
	
	return {
		handle : handle
	};

}());

module.exports = handler;