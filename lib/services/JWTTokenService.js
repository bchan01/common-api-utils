var Q 	= require('q'),
 	jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt');


var JWTTokenService = function (config) {
    this.issuer = config.issuer;
    this.timeout = config.timeout || 86400;
    this.secret = config.secret;
    this.audience = config.audience || 'JWTApp';
    this.subject = config.subject || 'noreply@b2mcomputing.com';
    this.saltRounds = config.saltRounds || 10;
};

JWTTokenService.prototype.getIssuer = function() {
    return this.issuer;
}

JWTTokenService.prototype.getTimeout = function() {
    return this.timeout;
}

JWTTokenService.prototype.getSecret = function() {
    return this.secret;
}

JWTTokenService.prototype.getAudience = function() {
    return this.audience;
}

JWTTokenService.prototype.getSubject = function() {
    return this.subject;
}

JWTTokenService.prototype.getSaltRounds = function() {
    return this.saltRounds;
}

JWTTokenService.prototype.encryptPassword = function(enterPassword) {
    var defer = Q.defer();
    if (!enterPassword || enterPassword.length < 1) {
        defer.reject({status: 400, message: 'Password is required'});
        return defer.promise;  
    }
    Q.ninvoke(bcrypt, "hash", enterPassword, this.saltRounds)
    .then(function(hashedPassword) {
        defer.resolve(hashedPassword)
    }).fail(function(error) {
        defer.reject({status: 500, message: 'Fail to encrypt password'});
    });
    return defer.promise;
};

JWTTokenService.prototype.decode = function(token) {
    return jwt.decode(token);
};

JWTTokenService.prototype.validate = function(token) {

    var valid = false;
    var errors = [];
    var payload = {};
    if( token !== undefined ) {
       try {
            payload = jwt.verify(token, this.secret);
            valid = true;
        }
        catch (err) {
            errors.push(err);
        }
    } else {
        // set missing token  error
        errors.push('Token missing.');
    }
    if( valid ) {
        // token is valid
        return valid;
    } else {
        // error condition, send errors
        return errors;
    }
};

JWTTokenService.prototype.refresh = function(token) {
    // this function takes a token/payload and returns a refreshed token, nothing more
    // it will return an empty string if called without a valid token
    var newToken = '';
    if(typeof token === 'string'){  // if token is string, assume it's JWT not payload object
        token = jwt.decode(token)
    }
    if( token ) {
        // refresh timestamp
        try {
            newToken = jwt.sign(token, this.secret, 
                    { expiresIn: this.timeout * 60 } // expires in n seconds
            );
        }
        catch (err) {
            console.log('Token.refresh - Error:');
            console.log(err);
            return
        }
    }
    return newToken;
};


JWTTokenService.prototype.authenticate = function(user, enterPass) {
    var auth = bcrypt.compareSync(enterPass, user.userPassword);
    if (auth) {
       var payload = {
            name : user.fullName,
            username : user.username,
            userId : user._id,
            roles : ["ReadWrite"]
        };
        console.log('payload:' + JSON.stringify(payload));
        var options = {
            expiresIn : this.timeout, // in seconds (24 hours)
            subject : user.username,
            audience : this.audience,
            issuer : this.issuer
        };
        //console.log('options:' + JSON.stringify(options));
        //console.log('secret:' + this.secret);
        var token = jwt.sign(payload, this.secret, options);

        //console.log('token:' + token);

        return Q.resolve(token);
    } else {
      return Q.reject({status: 401, message: 'Unauthorized Access'});
   }
};


JWTTokenService.prototype.validateRequestToken = function(req, res, next) {
    // needed req.baseUrl, saved res.locals.tokenPayload
        var jwtoken = req.header('x-access-token');
        var secrets = [];

        res.locals.tokenPayload = decode(jwtoken);
        res.locals.tokenValid = false;
      
        secrets.push(config.jwt.secret);

        var valid = validate(jwtoken, secrets);
        if( Array.isArray(valid) )  {
            // there are errors
            res.locals.status = 401;
            res.locals.message = 'Authorization failed. (Re)Authenticate.';
            Array.prototype.push.apply(res.locals.errors, valid);
            next(valid);
        } else {
            res.locals.username = res.locals.tokenPayload.username;
            res.locals.userId = res.locals.tokenPayload.userId;
            res.locals.tokenValid = true;
            next();
        }
};


// export the class
module.exports = JWTTokenService;






   


    

   
