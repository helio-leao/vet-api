const express = require('express');
const router = express.Router();

const Pacient = require('../models/Pacient');


router.get('/', async (req, res) => {
    try {
        const pacients = await Pacient.find();
        res.json(pacients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', getPacients, (req, res) => {
    res.json(res.pacient);
});

router.post('/', async (req, res) => {
    const newPacient = new Pacient({
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        birthdate: req.body.birthdate,
        tutor: req.body.tutor,
    });

    try {
        await newPacient.save();
        res.status(201).json(newPacient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/:id', getPacients, async (req, res) => {
    if(req.body.name) {
        res.pacient.name = req.body.name;
    }
    if(req.body.species) {
        res.pacient.species = req.body.species;
    }
    if(req.body.breed) {
        res.pacient.breed = req.body.breed;
    }
    if(req.body.birthdate) {
        res.pacient.birthdate = req.body.birthdate;
    }
    if(req.body.tutor) {
        res.pacient.tutor = req.body.tutor;
    }

    try {
        const updatedPacient = await res.pacient.save();
        res.json(updatedPacient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', getPacients, async (req, res) => {
    try {
        await res.pacient.deleteOne();
        res.json({ message: 'Deleted pacient' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


async function getPacients(req, res, next) {
    let pacient;

    try {
        pacient = await Pacient.findById(req.params.id);
        if(!pacient) {
            return res.status(404).json({ message: 'Cannot find pacient' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    res.pacient = pacient;
    next();
}


module.exports = router;