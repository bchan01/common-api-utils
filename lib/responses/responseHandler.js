// Provide helper methods for handling response

'use strict';
var responseBuilder = require('./responseBuilder');

var responseHandler = (function() {

    function populateResponse(req, res, domainName, data) {
        if (data) {
            res.locals.results = data;
        }
        res.status(res.locals.status);
        res.json(responseBuilder.build(res));
    }
    
    // ========================= Handle Success Response =================
    function handleSuccess(req, res, next, data, domainName) {
        if (data) {
            res.locals.status = 200;
            res.locals.message = res.locals.message || domainName + ' found';
        } else {
            res.locals.status = 404;
            res.locals.message = res.locals.message || domainName + ' not found';
        }
        populateResponse(req, res, domainName, data);
    };
    
   function handleDeleteSuccess(req, res, next, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' deleted successfully.';
        populateResponse(req, res, domainName);
    };
    
   function handleCreateSuccess(req, res, next, data, domainName) {
        res.locals.status = 201;
        res.locals.message = domainName + ' created successfully.';
	    data = data.toObject();
		delete data["__v"];
		populateResponse(req, res, domainName, data);
   }

   function handleUpdateSuccess(req, res, next, data, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' updated successfully.';   
        data = data.toObject();
        delete data["__v"];
        populateResponse(req, res, domainName, data);
   }

   // ========================= Handle Error Response =================
   function handleError(req, res, next, error, domainName) {
        if (error) {
            res.locals.status = error.status || 500;
            res.locals.message = error.message || 'Internal Server Error';
            res.locals.errors = error.errors || 'Unexpected error';
        } else {
            res.locals.status = 500;
            res.locals.message = 'Internal Server Error';
            res.locals.errors = 'Unexpected error';
        }
        populateResponse(req, res, domainName);
    }
    
    function handleCreateError(req, res, next, error, domainName) {
        if (error) {
            if(error.errmsg) {
                if(error.errmsg.indexOf('duplicate key error') > -1) {
                    res.locals.status = 409;
                    res.locals.message = domainName + " already exist.";
                } else {
                    res.locals.status = 500;
                    res.locals.message = error.errmsg;
                }
            } else  {
                res.locals.status = error.status  || 500;
                res.locals.message = error.message || 'Internal Server Error';     
            }  
            res.locals.errors = error.errors || 'Unexpected error';
        } 
        populateResponse(req, res, domainName);
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

module.exports = responseHandler;
