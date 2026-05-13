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
            const [username] = credentials.split(':');

            const user = await User.findOne({ username: username });
            if (!user) return res.status(404).json({ error: 'Invalid Basic credentials' });

            req.user = user;
            return next();
        }

        checkJwt(req, res, async (err, request, response) => {
            if (err) return;

            try {

                const auth0Sub = req.auth.payload.sub; 
                const token = authHeader.split(' ')[1];

                let user = await User.findOne({ auth0Sub: auth0Sub });

                if (user) {
                    req.user = user;
                    return next();
                }

                const userData = await getUserInfo(token);
                const { email } = userData;

                user = await User.findOne({ emailAddress: email });

                if (!user) {
                    return res.status(404).json({ error: 'User not found in database' });
                }
                
                await User.updateOne(
                    { _id: user._id }, 
                    { $set: { auth0Sub: auth0Sub } }
                );

                req.user = user;
                next();


                req.user = user;
                next();
            } catch (enrichmentError) {
                console.error('User Enrichment Error:', enrichmentError.message);
                res.status(500).json({ error: 'Authentication succeeded, but user profile linkage failed' });
            }
        });

    } catch (globalError) {
        console.error('Auth Guard Error:', globalError);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};

module.exports = { authGuard };
