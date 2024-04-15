import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {PDFExtract, PDFExtractOptions} from 'pdf.js-extract';
import Exam, { IExam } from '../models/Exam';
import Notification, { INotification } from '../models/Notification';
import Patient from '../models/Patient';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post('/upload', upload.single('file'), async (req, res) => {
    const {file} = req;

    if(!file || file.mimetype !== 'application/pdf') {
        return res.sendStatus(400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // fetch patient related to new exam
        const patient = await Patient.findById(req.body.patient);
        
        if(!patient) {
            return res.sendStatus(404);
        }

        // creates exams from pdf data
        const extractedData = await extractPdfData(file.buffer);
        const newExams = extractedData.exams.map(exam => new Exam({
            type: exam.type,
            unit: exam.unit,
            date: extractedData.date,
            result: exam.result,
            patient: req.body.patient,
        }));

        // generates notifications
        const newNotifications: INotification[] = [];
        newExams.forEach(exam => {
            const notificationMessage = generateNotificationMessage(exam, patient.species);

            if(notificationMessage) {
                newNotifications.push(new Notification({
                    message: notificationMessage,
                    exam: exam.id,
                }));
            }
        });

        // note: insertMany does test constraints but does not
        // pass through middleware like 'pre' and 'post'
        await Exam.insertMany(newExams, { session: session });
        await Notification.insertMany(newNotifications, { session: session });

        await session.commitTransaction();
        res.status(201).json({newExams, newNotifications});
    } catch (error) {
        await session.abortTransaction();
        res.sendStatus(400);
    } finally {
        session.endSession();
    }
});

router.post('/', async (req, res) => {
    try {
        // fetch patient related to new exam
        const patient = await Patient.findById(req.body.patient);
        
        if(!patient) {
            return res.sendStatus(404);
        }

        // creates new exam
        const newExam = new Exam({
            type: req.body.type,
            unit: req.body.unit,
            date: req.body.date,
            result: req.body.result,
            patient: req.body.patient,
        });


        const notificationMessage = generateNotificationMessage(newExam, patient.species);

        if (notificationMessage) {  // adds exam with notification
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
                res.status(201).json({newExam, newNotification});
            } catch {
                await session.abortTransaction();
                res.sendStatus(400);
            } finally {
                session.endSession();
            }
        } else {    // adds exam only
            await newExam.save();
            res.status(201).json({newExam, newNotification: null});
        }
    } catch (error) {
        res.sendStatus(500);
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


function getExamLimits(examType: string, species: ('felina' | 'canina')) {
    const catLimits: {[key: string]: ({unit?: string, min?: number, max?: number} | undefined)} = {
        'sódio': { unit: 'mEq/L', min: 145.8, max: 158.7 },
        'cloreto': { unit: 'mEq/L', min: 107.5, max: 129.6 },
        'potássio': { unit: 'mEq/L', min: 3.8, max: 5.3 },
        'cálcio total': { unit: 'mg/dL', min: 7.9, max: 10.9 },
        'cálcio ionizado': { unit: 'mmol/L', min: 1.1, max: 1.4 },
        'fósforo': { unit: 'mg/dL', min: 4, max: 7.3 },
        'magnésio': { unit: 'mg/dL', min: 1.9, max: 2.8 },
        'pressão arterial': { unit: 'mmHg', min: 120, max: 140 },
        'ureia': { unit: 'mg/dL', min: undefined, max: 60 },
        'densidade urinária': { unit: undefined, min: 1.035, max: undefined },
        'creatinina': { unit: 'mg/dL', min: undefined, max: 1.6 },
    }
    const dogLimits: {[key: string]: ({unit?: string, min?: number, max?: number} | undefined)} = {
        'sódio': { unit: 'mEq/L', min: 140.3, max: 159.9 },
        'cloreto': { unit: 'mEq/L', min: 102.1, max: 117.4 },
        'potássio': { unit: 'mEq/L', min: 3.8, max: 5.6 },
        'cálcio total': { unit: 'mg/dL', min: 8.7, max: 11.8 },
        'cálcio ionizado': { unit: 'mmol/L', min: 1.18, max: 1.4 },
        'fósforo': { unit: 'mg/dL', min: 2.9, max: 6.2 },
        'magnésio': { unit: 'mg/dL', min: 1.7, max: 2.7 },
        'pressão arterial': { unit: 'mmHg', min: 120, max: 140 },
        'ureia': { unit: 'mg/dL', min: undefined, max: 60 },
        'densidade urinária': { unit: undefined, min: 1.015, max: undefined },
        'creatinina': { unit: 'mg/dL', min: undefined, max: 1.4 },
    }

    if(species === 'felina') {
        return catLimits[examType];
    } else if(species === 'canina') {
        return dogLimits[examType];
    }
}

function generateNotificationMessage(exam: IExam, animalSpecies: ('felina' | 'canina')) {
    const examLimits = getExamLimits(exam.type, animalSpecies);

    // exam type not on 'getExamLimits' map
    if(!examLimits) return undefined;

    // creates notification message to be returned if conditions met
    let message = `${exam.type}`;

    switch(exam.type) {
        case 'albumina':
        case 'creatinina':
            message += ` sérica`;
            break;
        case 'fósforo':
        case 'sódio':
        case 'potássio':
        case 'cloreto':
        case 'magnésio':
            message += ` sérico`;
            break;
    }

    // returns notification message if exam result lower than min or higher than max limits
    if(examLimits.min && exam.result < examLimits.min) {
        return `${message} < ${examLimits.min}${examLimits.unit ? ` ${examLimits.unit}` : ``}`;
    } else if(examLimits.max && exam.result > examLimits.max) {
        return `${message} > ${examLimits.max}${examLimits.unit ? ` ${examLimits.unit}` : ``}`;
    } else {
        return undefined;
    }
}

async function extractPdfData(buffer: Buffer) {
    const DATA = ['albumina', 'globulinas', 'ureia', 'creatinina']; // note: ureia written like 'uréia' on example pdf
    let extractedData: {
        date: string,
        exams: {
            type: string,
            unit: string,
            result: number
        }[],
    } = { date: '', exams: [] };

    const pdfExtract = new PDFExtract();
    const options: PDFExtractOptions = {};

    try {
        const data = await pdfExtract.extractBuffer(buffer, options);
        const page1Content = data.pages[0].content;

        page1Content.forEach((value, index) => {
            const stringValue = value.str.toLowerCase();

            // search for date
            if(stringValue === 'data de entrada:') {
                extractedData.date = formatDateString(page1Content[index - 1].str);
            }

            // search for exams
            const found = DATA.some(key => stringValue.match(key) !== null);

            if(found) {
                extractedData.exams.push({
                    type: stringValue,
                    unit: page1Content[index + 2].str,
                    result: Number(
                        page1Content[index + 5].str.replace(',', '.')),
                });
            }
        });

        return extractedData;
    } catch (error) {
        throw error;
    }
}

function formatDateString(date: string) {
    const parts = date.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`
}


export default router;