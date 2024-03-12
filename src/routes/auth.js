const express = require('express');
const router = express.Router();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
            .select('+password').exec();

        if(!await bcrypt.compare(req.body.password, user.password)) {
            res.sendStatus(401);
        }

        const authData = { id: user.id, email: user.email };
        const accessToken = jwt.sign(authData, process.env.ACCESS_TOKEN_SECRET);
        res.send({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/logout', async (req, res) => {
    res.send({ message: 'todo: logout' });
});


module.exports = router;