'use strict';

/* this builds the json Response envelope */
var json = (function(){

	var build = function(res){
		var response = {
			outcome: {}
		};

		response.outcome.code = res.locals.status;
		response.outcome.message = res.locals.message;

		if( res.locals.errors.length > 0 ) {
        	response.outcome.errors = res.locals.errors;
		}
		response.data = res.locals.results;
		
		return response;
	};

	return {
		build: build
	};
}());

module.exports = json;
