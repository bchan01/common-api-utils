// Middleware for initializing common API response data structure
'use strict';


var handler = (function() {
  
	function handle(req, res, next) {
		res.locals.errors = [];
		next();
	}
	
	return {
		handle: handle,
	};

}());

module.exports = handler;