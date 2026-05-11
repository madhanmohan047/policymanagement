const { auth } = require('express-oauth2-jwt-bearer');
require('dotenv').config();

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

const checkBasicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Basic authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username === process.env.BASIC_USER && password === process.env.BASIC_PASS) {
    req.auth = { payload: { sub: 'basic_admin', email: 'admin@local.dev' } };
    return next();
  }
  res.status(401).json({ error: 'Invalid credentials' });
};


const authGuard = (req, res, next) => {
  const mode = process.env.AUTH_MODE || 'JWT';

  if (mode === 'BASIC') {
    return checkBasicAuth(req, res, next);
  } else {
    return checkJwt(req, res, next);
  }
};

module.exports = { authGuard };
