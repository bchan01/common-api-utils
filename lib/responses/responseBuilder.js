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
		
		if( Object.getOwnPropertyNames(res.locals.customOutcome).length > 0 ) {
		for( var prop in res.locals.customOutcome ) {
				if( res.locals.customOutcome.hasOwnProperty(prop) ) {
					response.outcome[prop] = res.locals.customOutcome[prop];
				}
			}
		}

		return response;
	};

	return {
		build: build
	};
}());

module.exports = json;
