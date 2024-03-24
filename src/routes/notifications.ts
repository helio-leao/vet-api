import express from 'express';
import mongoose from 'mongoose';
import authenticateToken from '../middlewares/authenticateToken';
import Notification from '../models/Notification';

const router = express.Router();


router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.aggregate([
            {
                '$lookup': {
                    'from': 'exams', 
                    'localField': 'exam', 
                    'foreignField': '_id', 
                    'as': 'exam'
                }
            }, {
                '$unwind': {
                    'path': '$exam'
                }
            }, {
                '$lookup': {
                    'from': 'patients', 
                    'localField': 'exam.patient', 
                    'foreignField': '_id', 
                    'as': 'exam.patient'
                }
            }, {
                '$unwind': {
                    'path': '$exam.patient'
                }
            }, {
                '$match': {
                    'exam.patient.user': new mongoose.Types.ObjectId(req.user.id)
                }
            }, {
                '$sort': {
                    'exam.date': -1
                }
            }
        ]);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete-many', authenticateToken, async (req, res) => {
    try {
        const result = await Notification.deleteMany({ _id: { $in: req.body.ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No records found with the provided IDs' });
        }
        
        res.json({ message: `${result.deletedCount} records deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/update-many-notification-status', authenticateToken, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { _id: { $in: req.body.ids } },
            { $set: { status: 'READ' } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'No records found with the provided IDs' });
        }

        res.json({ message: `${result.modifiedCount} records updated` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;