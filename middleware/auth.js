const auth = require('basic-auth');

const basicAuth = (req, res, next) => {
    const credentials = auth(req);
    if (!credentials || credentials.name !== 'admin' || credentials.pass !== 'password') {
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).send('Access denied');
    }
    req.userContext = { id: credentials.name, groups: ['Internal_Users'] };
    next();
};

module.exports = basicAuth;