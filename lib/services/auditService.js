'use strict';

var model = require('../models/auditEvent'),
    _ = require('lodash');

module.exports = {
    log : log
};

function save(auditData) {  
    var auditDBObject = model(auditData);
    auditDBObject.save(function(err) {
        if (err) throw err;
    });
}

function log(req, res) {
     
    var user = "anonymousUser";
    if (res.locals && res.locals.username) {
        user = res.locals.username || "anonymousUser";
    }
    var auditData = {
        "username" : user,
        "evenType" : name ||  req.path
        "eventDate" : new Date().toISOString(),
        "data" : {
            "request": {
                "path" : req.path,
                "method" : req.method,
                "hostname" : req.hostname,
                "remoteIPAddress" : req.ip
            }
        }
    };
   
    if (!_.isEmpty(req.params)) {
        auditData['data']['request']['params'] = req.params;
    }
    if (!_.isEmpty(req.query)) {
        auditData['data']['request']['query'] = req.query;
    }
    if (!_.isEmpty(req.body)) {
        auditData['data']['request']['body'] = req.body;
    }
    
    if (res.locals.status && res.locals.message) {
        var response = {'status' : res.locals.status, 'message' : res.locals.message};
		auditData['data']['response'] = response;
    }
    
    console.log('>>>>> AUDIT:' + JSON.stringify(auditData));
    save(auditData); 
}

    
