var JWTTokenService = require('../services/JWTTokenService'),
	responseBuilder = require('../responses/responseBuilder');

function validate(config) {
  var tokenService = new  JWTTokenService(config);
  return function(req, res, next) {
		var token = req.header(config['tokenHeaderName']);
		res.locals = tokenService.validate(token, res.locals);
		if (res.locals.tokenValid) {
			next();
		} else {
			res.status(res.locals.status);     
			res.json(responseBuilder.build(res));
		}
  }
}

module.exports = {
    validate : validate
};
