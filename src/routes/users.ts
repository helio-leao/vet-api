import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const router = express.Router();


router.get('/', async (_req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch {
        res.sendStatus(500);
    }
});

router.get('/:id', getUser, (_req, res) => {
    res.json(res.user);
});

router.post('/', async (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
    });

    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch {
        res.sendStatus(400);
    }
});

router.patch('/:id', getUser, async (req, res) => {
    if(req.body.email) {
        res.user.email = req.body.email;
    }
    if(req.body.password) {
        res.user.password = req.body.password;
    }

    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch {
        res.sendStatus(400);
    }
});

router.delete('/:id', getUser, async (_req, res) => {
    try {
        await res.user.deleteOne();
        res.json({ message: 'Deleted user' });
    } catch {
        res.sendStatus(500);
    }
});


async function getUser(req: Request, res: Response, next: NextFunction) {
    let user;

    try {
        user = await User.findById(req.params.id);
        if(!user) {
            return res.sendStatus(404);
        }
    } catch {
        res.sendStatus(500);
    }

    res.user = user;
    next();
}


export default router;