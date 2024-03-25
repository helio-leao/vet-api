import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Exam, { IExam } from '../models/Exam';
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
    
    const notificationMessage = generateNotificationMessage(newExam);
    
    if(notificationMessage) {
        const newNotification = new Notification({
            message: notificationMessage,
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
    } else {
        try {
            await newExam.save();
            res.status(201).json(newExam);
        } catch (err) {
            res.sendStatus(400);
        }
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


function generateNotificationMessage(exam: IExam) {
    const catsRatesLimits: {[key: string]: ({min?: number, max?: number} | undefined)} = {
        'sódio': {  // mEq/L or mmol/L
            min: 145.8,
            max: 158.7,
        },
        'cloreto': {    // mEq/L or mmol/L
            min: 107.5,
            max: 129.6,
        },
        'potássio': {   // mEq/L or mmol/L
            min: 3.8,
            max: 5.3,
        },
        'cálcio total': {   // mg/dL
            min: 7.9,
            max: 10.9,
        },
        'cálcio ionizado': {    // mg/dL
            min: 4.5,
            max: 5.5,
        },
        'magnésio': {   // mg/dL
            min: 1.9,
            max: 2.8,
        },
        'fósforo': {    // mg/dL
            min: 4,
            max: 7.3,
        },
        'pressão arterial': {
            min: 120,
            max: 160,
        },
        'ureia': {
            min: undefined,
            max: 60,
        },
        'densidade urinária': {
            min: 1.035,
            max: undefined,
        },
        // 'albumina_globulinas_ratio': { // Se < 0.5 ou maior que 1.7
        //     min: 0.5,
        //     max: 1.7,
        // },
        // 'creatinina': { // Se aumentar em relação ao valor anterior ou se passar de 1.6
        //     min: undefined,
        //     max: 1.6,
        // },
        // 'rpcu': { // Se aumentar em relação ao valor anterior ou passar de 0.4
        //     min: undefined,
        //     max: 0.4,
        // },
    }

    const examLimits = catsRatesLimits[exam.type];

    if(!examLimits) {
        return undefined;
    }

    if(examLimits.min && exam.result < examLimits.min) {
        return `${exam.type} abaixo de ${examLimits.min}`;
    }
    
    if(examLimits.max && exam.result > examLimits.max) {
        return `${exam.type} acima de ${examLimits.max}`;
    }
}


export default router;