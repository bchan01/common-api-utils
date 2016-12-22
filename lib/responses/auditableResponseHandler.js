// Provide helper methods for handling response and writing an entry to audit log

'use strict';
var responseBuilder = require('./responseBuilder'),
    auditService = require('../services/auditService');

var auditableRouterHelper = (function() {
    
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
        auditService.log(req, res, domainName)
        res.json(responseBuilder.build(res));
    };
    
   
   function handleDeleteSuccess(req, res, next, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' deleted successfully.';
        auditService.log(req, res, domainName)
        res.json(responseBuilder.build(res));
    };
    
   function handleCreateSuccess(req, res, next, data, domainName) {
        res.locals.status = 201;
        res.locals.message = domainName + ' created successfully.';
	    data = data.toObject();
		delete data["__v"];
		res.locals.results = data;
        auditService.log(req, res, domainName)
        res.json(responseBuilder.build(res));
   }

   function handleUpdateSuccess(req, res, next, data, domainName) {
        res.locals.status = 200;
        res.locals.message = domainName + ' updated successfully.';   
        data = data.toObject();
        delete data["__v"];
        res.locals.results = data;
        auditService.log(req, res, domainName)
        res.json(responseBuilder.build(res));
   }
   
   // ========================= Handle Error Response =================
   function handleError(req, res, next, error, domainName) {
        if(!res.locals.status) {
            res.locals.status = error.status || 500;
            res.locals.message = error.message || 'Internal Server Error';
            res.locals.errors.push(error);
        }
        auditService.log(req, res, domainName)
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
        auditService.log(req, res, domainName)    
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

module.exports = auditableRouterHelper;
