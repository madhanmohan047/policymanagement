const axios = require('axios');
const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/User'); 

const getUserInfo = async (token) => {
    const userInfoURL = process.env.AUTH0_USERINFO_URL; 
    const response = await axios.get(userInfoURL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; 
};

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

const authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const env = process.env.NODE_ENV;

  try {
    if (env === 'local' && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      const user = await User.findOne({ username: username }); 
      if (!user) return res.status(404).json({ error: 'Invalid Basic credentials' });
      
      req.user = user;
      return next();
    }
    
    checkJwt(req, res, async (err, request, response) => {
      if (err) {
        return; 
      }

      try {
        const token = authHeader.split(' ')[1];
        const userData = await getUserInfo(token);
        const { email } = userData;
        
        const user = await User.findOne({ emailAddress: email });
        if (!user) {
          return res.status(404).json({ error: 'User not found in database' });
        }

        req.user = user;
        next();
      } catch (enrichmentError) {
        console.error('User Enrichment Error:', enrichmentError.message);
        res.status(500).json({ error: 'Authentication succeeded, but user profile fetch failed' });
      }
    });

  } catch (globalError) {
    console.error('Auth Guard Error:', globalError);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

module.exports = { authGuard };
