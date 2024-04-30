import express, { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import authenticateToken from '../middlewares/authenticateToken';
import Patient from '../models/Patient';
import Exam from '../models/Exam';

// todo: delete images updated or deleted

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const storage = multer.diskStorage({
    filename: function(_req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage});


router.post('/picture', upload.single('picture'), async (req, res) => {
    try {
        if(req.file) {
            const response = await cloudinary.uploader.upload(req.file.path);
            res.json(response);
        }        
    } catch {
        res.sendStatus(500);
    }
});

router.get('/:id/exams', async (req, res) => {
    try {
        const exams = await Exam.find({ patient: req.params.id }).sort({date: 1});
        res.json(exams);
    } catch {
        res.sendStatus(500);
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const patients = await Patient.find({ user: req.user.id });
        res.json(patients);
    } catch {
        res.sendStatus(500);
    }
});

router.get('/:id', authenticateToken, getPatient, (_req, res) => {
    res.json(res.patient);
});

router.post('/', authenticateToken, async (req, res) => {
    const newPatient = new Patient({
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        birthdate: req.body.birthdate,
        user: req.user.id,
        tutorName: req.body.tutorName,
        pictureUrl: req.body.pictureUrl,
        healthDescription: req.body.healthDescription,
    });

    try {
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch {
        res.sendStatus(400);
    }
});

router.patch('/:id', authenticateToken, getPatient, async (req, res) => {
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
    if(req.body.tutorName) {
        res.patient.tutorName = req.body.tutorName;
    }
    if(req.body.pictureUrl) {
        res.patient.pictureUrl = req.body.pictureUrl;
    }
    if(req.body.healthDescription) {
        res.patient.healthDescription = req.body.healthDescription;
    }

    try {
        const updatedPatient = await res.patient.save();
        res.json(updatedPatient);
    } catch {
        res.sendStatus(400);
    }
});

router.delete('/:id', authenticateToken, getPatient, async (_req, res) => {
    try {
        await res.patient.deleteOne();
        res.json({ message: 'Deleted patient' });
    } catch {
        res.sendStatus(500);
    }
});


async function getPatient(req: Request, res: Response, next: NextFunction) {
    let patient;

    try {
        patient = await Patient.findOne({ _id: req.params.id, user: req.user.id });
        if(!patient) {
            return res.sendStatus(404);
        }
    } catch {
        res.sendStatus(500);
    }

    res.patient = patient;
    next();
}


export default router;