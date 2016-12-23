// Provide helper methods for handling response at express route level
'use strict';
var responseBuilder = require('./responseBuilder');

var routeHelper = (function() {
    
    // ========================= Handle Success Response =================
    function handleSuccess(req, res, next, data, domainName) {
        if (data) {
            res.locals.status = 200;
            res.locals.message = res.locals.message || domainName + ' found';
            res.locals.results = data;
        } else {
            res.locals.status = 404;
            res.locals.message = res.locals.message || domainName + ' not found';
        }
        res.json(responseBuilder.build(res));
    };
    
   
   function handleDeleteSuccess(req, res, next, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' deleted successfully.';
        res.json(responseBuilder.build(res));
    };
    
   function handleCreateSuccess(req, res, next, data, domainName) {
        res.locals.status = 201;
        res.locals.message = domainName + ' created successfully.';
	    data = data.toObject();
		delete data["__v"];
		res.locals.results = data;
        res.json(responseBuilder.build(res));
   }

   function handleUpdateSuccess(req, res, next, data, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' updated successfully.';   
        data = data.toObject();
        delete data["__v"];
        res.locals.results = data;
        res.json(responseBuilder.build(res));
   }
   
   // ========================= Handle Error Response =================
   function handleError(req, res, next, error) {
        if(!res.locals.status) {
            res.locals.status = error.status || 500;
            res.locals.message = error.message || 'Internal Server Error';
            res.locals.errors.push(error);
        }
	    res.status(res.locals.status);     
        res.json(responseBuilder.build(res));
    }

    
    function handleCreateError(req, res, next, error, domainName) {
        if(error && error.errmsg && error.errmsg.indexOf('duplicate key error')>-1) {
            res.locals.status = 409;
            res.locals.message = domainName + " already exist.";
            res.locals.errors.push(error);
        } else if(error && error.message) {
            res.locals.status = 404;
            res.locals.message = error.message;
            res.locals.errors.push(error);
        } else if(!res.locals.status) {
            res.locals.status = error.status || 500;
            res.locals.message = error.message || 'Internal Server Error';
            res.locals.errors.push(error);
        }
	    res.status(res.locals.status);     
        res.json(responseBuilder.build(res));
    }

    
	return {
		handleError: handleError,
        handleCreateError: handleCreateError,
        handleSuccess: handleSuccess,
		handleCreateSuccess: handleCreateSuccess,
        handleUpdateSuccess: handleUpdateSuccess,
        handleDeleteSuccess : handleDeleteSuccess
	};

}());

module.exports = routeHelper;
