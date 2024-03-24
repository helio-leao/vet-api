import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam';
import Notification from '../models/Notification';

const router = express.Router();


router.post('/', async (req, res) => {
    const newExam = new Exam({
        type: req.body.type,
        unit: req.body.unit,
        date: req.body.date,
        result: req.body.result,
        patient: req.body.patient,
    });

    const newNotification = new Notification({
        message: `Taxa de ${newExam.type} atualizada para ${newExam.result} ${newExam.unit}`,
        exam: newExam.id,
    });

    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        await newExam.save({ session: session });
        await newNotification.save({ session: session });

        await session.commitTransaction();

        res.status(201).json(newExam);
    } catch (error) {
        await session.abortTransaction();

        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
});

router.patch('/:id', getExam, async (req, res) => {
    if(req.body.type) {
        res.exam.type = req.body.type;
    }
    if(req.body.date) {
        res.exam.date = req.body.date;
    }
    if(req.body.result) {
        res.exam.result = req.body.result;
    }
    if(req.body.patient) {
        res.exam.patient = req.body.patient;
    }

    try {
        const updatedExam = await res.exam.save();
        res.json(updatedExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', getExam, async (req, res) => {
    try {
        await res.exam.deleteOne();
        res.json({ message: 'Deleted exam' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


async function getExam(req, res, next) {
    let exam;

    try {
        exam = await Exam.findById(req.params.id);
        if(!exam) {
            return res.status(404).json({ message: 'Cannot find exam' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    res.exam = exam;
    next();
}


export default router;