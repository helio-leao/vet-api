const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const Patient = require('../models/Patient');


router.get('/', authenticateToken, async (req, res) => {
    console.log(req.user)
    try {
        // const patients = await Patient.find();
        const patients = await Patient.find({ tutor: req.user.id });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', getPatients, (req, res) => {
    res.json(res.patient);
});

router.post('/', async (req, res) => {
    const newPatient = new Patient({
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        birthdate: req.body.birthdate,
        tutor: req.body.tutor,
    });

    try {
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/:id', getPatients, async (req, res) => {
    if(req.body.name) {
        res.patient.name = req.body.name;
    }
    if(req.body.species) {
        res.patient.species = req.body.species;
    }
    if(req.body.breed) {
        res.patient.breed = req.body.breed;
    }
    if(req.body.birthdate) {
        res.patient.birthdate = req.body.birthdate;
    }
    if(req.body.tutor) {
        res.patient.tutor = req.body.tutor;
    }

    try {
        const updatedPatient = await res.patient.save();
        res.json(updatedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', getPatients, async (req, res) => {
    try {
        await res.patient.deleteOne();
        res.json({ message: 'Deleted patient' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


async function getPatients(req, res, next) {
    let patient;

    try {
        patient = await Patient.findById(req.params.id);
        if(!patient) {
            return res.status(404).json({ message: 'Cannot find patient' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    res.patient = patient;
    next();
}


module.exports = router;