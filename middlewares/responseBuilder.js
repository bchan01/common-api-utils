'use strict';

/* this builds the json Response envelope */
var json = (function(){

	var build = function(res){
		var response = {
			outcome: {}
		};

		response.outcome.code = res.locals.status;
		// TODO - if there is no specified message, then lookup message form table of std responses
		response.outcome.message = res.locals.message;

		//response.outcome.errors = [];
		if( res.locals.validationErrors ) {
			response.outcome.errors = res.locals.validationErrors;
			//for( var i=0; i < res.locals.validationErrors.length; i++) {
				// push errors on response.outcome.errors
			//}
		}
		if( res.locals.errors.length > 0 ) {
			//for( var i=0; i < res.locals.errors.length; i++) {
				// push errors on outcome.errors
				//response.outcome.details = res.locals.errors;
                response.outcome.errors = res.locals.errors;
			//}
		}

		// use a variable like res.locals.results{}
		// to store result data to be returned

		// result data should be sent as an array
		// if res.locals.results is not an array, then wrap it in an array
		//if( res.locals.results && (res.locals.results.length > 0) ) {
		if( Array.isArray(res.locals.results) ) {
			response.data = res.locals.results;
		} else {
			response.data = [ res.locals.results ];
		}
		//}

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