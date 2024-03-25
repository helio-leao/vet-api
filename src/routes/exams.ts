import express, { Request, Response, NextFunction } from 'express';
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
    } catch {
        await session.abortTransaction();
        res.sendStatus(400);
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
    } catch {
        res.sendStatus(400);
    }
});

router.delete('/:id', getExam, async (_req, res) => {
    try {
        await res.exam.deleteOne();
        res.json({ message: 'Deleted exam' });
    } catch {
        res.sendStatus(500);
    }
});


async function getExam(req: Request, res: Response, next: NextFunction) {
    let exam;

    try {
        exam = await Exam.findById(req.params.id);
        if(!exam) {
            return res.sendStatus(404);
        }
    } catch {
        res.sendStatus(500);
    }

    res.exam = exam;
    next();
}


export default router;