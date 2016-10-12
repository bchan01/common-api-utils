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


JWTTokenService.prototype.generate = function(payload, secret, options) {
    var token = jwt.sign(payload, secret, options);
    return token;
};

JWTTokenService.prototype.generateStd = function(payload, secret, options) {
    // set payload defaults
    //payload.jti = payload.jti || 'some random value';
    // set default secret
    var jwtSecret = secret || this.secret;
    // set options defaults
    options.expiresIn = options.expiresIn || (this.timeout * 60 );
    options.issuer = this.issuer;
    options.subject = options.subject || this.subject;
    options.audience = options.audience || this.audience;
    return generate(payload, jwtSecret, options);
};

JWTTokenService.prototype.validate = function(token, secrets, options) {

    var valid = false;
    var errors = [];
    var payload = {};

    // make sure secrets is an array
    if( !Array.isArray(secrets) ) {
        // if not and it's length > 0 then turn it into an array
        // this will allow comma delimited strings to work as well
        if( secrets.length > 0 ) {
            secrets = secrets.split(',');
        }
    }

    if( token !== undefined ) {
        for( var i=0; i<secrets.length; i++ ) {
            try {
                // VERIFYING the token, will throw an error if not valid
                payload = jwt.verify(token, secrets[i], options);
                valid = true;
                break; // we found a secret that works
            }
            catch (err) {
                errors.push(err);
            }
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
        token = decode(token)
    }
    if( token ) {
        // refresh timestamp
        try {
            newToken = jwt.sign(token, this.secret, {
                //expiresInMinutes: config.jwt_id.timeout  // expires in n minutes
                expiresIn: this.timeout * 60 // expires in n seconds
            });
        }
        catch (err) {
            console.log('Token.refresh - Error:');
            console.log(err);
            return
        }
    }

    return newToken;
};

JWTTokenService.prototype.decode = function(jwtToken){
	return jwt.decode(jwtToken)
};

JWTTokenService.prototype.createToken = function(user) {
    var payload = {
        name : user.fullName,
        username : user.username,
        userId : user._id,
        roles : ["ReadWrite"]
    };
    var options = {
        expiresIn : this.timeout, // in seconds (24 hours)
        subject : user.username,
        audience : this.audience
    };

    // Use default secret
    console.log('generateStd started');
    var token = generateStd(payload, null, options);
    console.log('generateStd ended');
    return Q.resolve(token);
};

JWTTokenService.prototype.authenticate = function(user, enterPass) {
        var auth = bcrypt.compareSync(enterPass, user.userPassword);
        if (auth) {
          console.log('authenticate succeeded');
          return createToken(user);
        } else {
          console.log('authenticate failed');
          return Q.reject({status: 401, message: 'Unauthorized Access'});
       }
    };

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

// export the class
module.exports = JWTTokenService;






   


    

   
