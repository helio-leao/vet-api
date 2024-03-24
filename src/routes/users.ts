import express from 'express';
import User from '../models/User';

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', getUser, (req, res) => {
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
    } catch (error) {
        res.status(400).json({ message: error.message });
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.deleteOne();
        res.json({ message: 'Deleted user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


async function getUser(req, res, next) {
    let user;

    try {
        user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    res.user = user;
    next();
}


export default router;