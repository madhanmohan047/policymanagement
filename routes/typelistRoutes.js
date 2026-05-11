const express = require('express');
const router = express.Router();
const { 
    AccountStatus, ContactRole, ContactType, Country, Currency, 
    JobStatus, JobType, Product, State, UserType, PolicyStatus, BodyType 
} = require('../models');

router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let model;

        const typeMap = {
            'AccountStatus': AccountStatus,
            'ContactRole': ContactRole,
            'ContactType': ContactType,
            'Country': Country,
            'Currency': Currency,
            'JobStatus': JobStatus,
            'JobType': JobType,
            'Product': Product,
            'State': State,
            'UserType': UserType,
            'PolicyStatus': PolicyStatus,
            'BodyType': BodyType
        };

        model = typeMap[type];

        if (!model) {
            return res.status(404).json({ message: "Type not found" });
        }

        const typelist = await model.find();
        const result = typelist.map(item => ({ 
            code: item.code, 
            name: item.name, 
            priority: item.priority 
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
