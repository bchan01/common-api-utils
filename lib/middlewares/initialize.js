
'use strict';


var handler = (function() {
  
	function handle(req, res, next) {
		res.locals.results = [];
        res.locals.details = [];
		res.locals.errors = [];
		res.locals.validationErrors = [];
		res.locals.customOutcome = {};
		next();
	}
	
	return {
		handle: handle,
	};

}());

module.exports = handler;