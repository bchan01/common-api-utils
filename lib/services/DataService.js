/**
 * Generic service to handle CRUD operations
 * Created by bchan on 4/8/16.
 */
var Q               = require('q'),
    mongoose = require('mongoose'),
    defaultExcludeFields    = {"__v":0};
 
var DataService = function (schemaPath, schemaName, description) {
    this.schemaPath = schemaPath;
    this.schemaName = schemaName;
    this.description = description;
};

DataService.prototype.getSchemaName = function() {
    return this.schemaName;
}

DataService.prototype.getSchemaPath = function() {
    return this.schemaPath;
}

DataService.prototype.getDescription = function() {
    return this.description;
}


DataService.prototype.getCount = function(query) {
    console.log('DataService.getCount() - query:' + JSON.stringify(query));
    var model = require(this.schemaPath + '/' + this.schemaName);
    return Q.ninvoke(model,"count",query);
};

DataService.prototype.get = function(query, excludes) {
    var excludeFields = defaultExcludeFields;
    if (excludes) {
        excludeFields = excludes;
        excludeFields['__v'] = 0;
    } 
    console.log('DataService.get() - query:' + JSON.stringify(query) 
        + ',excludeFields:' + JSON.stringify(excludeFields)
        + ',schema:' + this.schemaName);
    var defer = Q.defer();
    var domain = this.description;
    var model = require(this.schemaPath + '/' + this.schemaName);
    // If _id exists in query, check if it's a valid ObjectId
    var funcName = 'findOne';
    if (query['_id']) {
        if (!mongoose.Types.ObjectId.isValid(query['_id'])) {
            defer.reject({status: 400, message: 'Invalid _id value for ' + domain});
        }
        funcName = 'findById';
    }
    Q.ninvoke(model, funcName, query, excludeFields)
        .then(function(dbObj) {
            if (!dbObj) {
                defer.reject({status: 404, message: domain + ' not found.'});
            }
            defer.resolve(dbObj);
        })
        .fail(function(err) {
            defer.reject(err);
        });
    return defer.promise;
};

DataService.prototype.getAll = function(query, excludes, orderBy, orderDirection) {
    var excludeFields = defaultExcludeFields;
    if (excludes) {
        excludeFields = excludes;
        excludeFields['__v'] = 0;
    } 
    console.log('DataService.getAll() - query:' + JSON.stringify(query) 
        + ',excludeFields:' + JSON.stringify(excludeFields)
        + ',schema:' + this.schemaName);
    var defer = Q.defer();
    var domain = this.description;
    var model = require(this.schemaPath + '/' + this.schemaName);
    var options = {};
    if (orderBy && orderDirection) {
        var order = orderBy;
        var direction = orderDirection || 1;
        options.sort = {};
        options.sort[order] = direction;
    }
    Q.ninvoke(model, "find", query, excludeFields, options)
        .then(function(dbObj) {
            if (!dbObj) {
                defer.reject({status: 404, message: domain + ' not found.'});
            }
            if (Array.isArray(dbObj) && dbObj.length < 1) {
                defer.reject({status: 404, message: domain + ' not found.'});
            }
            defer.resolve(dbObj);
        })
        .fail(function(err) {
            defer.reject(err);
        });
    return defer.promise;
};

 DataService.prototype.create = function(data, query) {
    var model = require(this.schemaPath + '/' + this.schemaName);
   
    if (query) { // Dup Check
        var defer = Q.defer();
        var domain = this.description;
        console.log('DataService.create() - query:' + JSON.stringify(query) + ',schema:' + this.schemaName);
        Q.ninvoke(model, "findOne", query)
            .then(function(dbObject) {
                if(dbObject) {
                    defer.reject({ status: 400, message: domain + ' already exists.'});
                } else {
                    var newDbObject = model(data);
                    Q.ninvoke(model, "create", newDbObject)
                        .then(function(dbObject) {
                           defer.resolve(dbObject);
                        }).fail(function(err) {
                            defer.reject(err);
                    });
                }
            })
            .fail(function(err) {
                defer.reject(err);
            });
        return defer.promise;

    } else {  // No Dup Check
        console.log('DataService.create()')
        var newDbObject = model(data);
        return Q.ninvoke(model, "create", newDbObject);
    }
 };
 
 DataService.prototype.update = function(data, query) {
    var defer = Q.defer();
    var domain = this.description;
    console.log('DataService.update() - query:' + JSON.stringify(query));
    console.log('DataService.update() - data:' + JSON.stringify(data));
    var model = require(this.schemaPath + '/' + this.schemaName);
    // If _id exists in query, check if it's a valid ObjectId
    var funcName = 'findOne';
    if (query['_id']) {
        if (!mongoose.Types.ObjectId.isValid(query['_id'])) {
            defer.reject({status: 400, message: 'Invalid _id value for ' + domain});
        }
        funcName = 'findById';
    }
    Q.ninvoke(model, funcName, query)
        .then(function(dbObject) {
            if(dbObject) {
                for(var key in data) {
                    if (key !== "_id") { // don't update _id field
                        dbObject[key] = data[key];
                    }
                }
                dbObject.save( function(err, result) {
                    if(err) {
                        defer.reject(err);
                    }
                    defer.resolve(result);
                });
            } else {
                defer.reject({ status: 404, message: domain + ' not found.'});
            }
        })
        .fail(function(err) {
            defer.reject(err);
        });

    return defer.promise;
};
   
DataService.prototype.delete = function(query) {
    var defer = Q.defer();
    var domain = this.description;
    console.log('DataService.delete() - query:' + JSON.stringify(query));
    var model = require(this.schemaPath + '/' + this.schemaName);
    // If _id exists in query, check if it's a valid ObjectId
    var funcName = 'findOne';
    if (query['_id']) {
        if (!mongoose.Types.ObjectId.isValid(query['_id'])) {
            defer.reject({status: 400, message: 'Invalid _id value for ' + domain});
        }
        funcName = 'findById';
    }
    Q.ninvoke(model, "findOne", query)
        .then(function(dbObject) {
            if(dbObject) {
                Q.ninvoke(model, "remove", query)
                    .then( function(result) {
                        defer.resolve({status: 200, message: domain + ' deleted.'});
                    })
                    .fail( function(err) {
                        defer.reject(err);
                    });
            } else {
                defer.reject({status: 404, message: domain + ' not found.'});
            }
        });

    return defer.promise;
};

// export the class
module.exports = DataService;