'use strict';

var model = require('./auditEvent'),
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

function log(req, res, name) {
     
    console.log('>>>>> AUDIT for name:' + name);
    var user = "anonymous";
    if (res.locals && res.locals.username) {
        user = res.locals.username || "anonymousUser";
    }
    var eventType = req.method + ' ' + req.baseUrl;
    if (name) {
        eventType = req.method + ' ' + name;
    } 

    var auditData = {
        "username" : user,
        "eventType" : eventType,
        "eventDate" : new Date().toISOString(),
        "data" : {
            "request": {
                "method" : req.method,
                "originalUrl" : req.originalUrl,
                "baseUrl" : req.baseUrl,
                "path" : req.path,
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
    } else {

    }
    
    console.log('>>>>> AUDIT:' + JSON.stringify(auditData));
    save(auditData); 
}

    
