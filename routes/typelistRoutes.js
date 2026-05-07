const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { AccountStatus, ContactRole, ContactType, Country, Currency, JobStatus, JobType, Product, State, UserType, PolicyStatus, VehicleBodyType } = require('../models');

router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let typelist;

        switch (type) {
            case 'AccountStatus':
                typelist = await AccountStatus.find();
                break;
            case 'ContactRole':
                typelist = await ContactRole.find();
                break;
            case 'ContactType':
                typelist = await ContactType.find();
                break;
            case 'Country':
                typelist = await Country.find();
                break;
            case 'Currency':
                typelist = await Currency.find();
                break;
            case 'JobStatus':
                typelist = await JobStatus.find();
                break;
            case 'JobType':
                typelist = await JobType.find();
                break;
            case 'Product':
                typelist = await Product.find();
                break;
            case 'State':
                typelist = await State.find();
                break;
            case 'UserType':
                typelist = await UserType.find();
                break;
            case 'BodyType':
                typelist = await VehicleBodyType.find();
                break;
            case 'PolicyStatus':
                typelist = await PolicyStatus.find();
                break;
            default:
                return res.status(404).json({ message: "Type not found" });
        }

        typelist = typelist.map(item => ({ code: item.code, name: item.name, priority: item.priority }));

        res.json(typelist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;