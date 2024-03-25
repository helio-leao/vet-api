import express from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
            .select('+password').exec();

        if(!user) {
            return res.sendStatus(404);
        }

        if(!await bcrypt.compare(req.body.password, user.password)) {
            return res.sendStatus(401);
        }

        const authData = { id: user.id, email: user.email };
        const accessToken = jwt.sign(authData, process.env.ACCESS_TOKEN_SECRET!);
        res.json({ accessToken });
    } catch {
        res.sendStatus(500);
    }
});

router.delete('/logout', async (req, res) => {
    res.json({ message: 'todo: logout' });
});


export default router;