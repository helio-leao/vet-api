const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const Notification = require('../models/Notification');


// todo: query by user id
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate({
                path: 'exam',
                populate: {
                    path: 'patient',
                    match: { user: req.user.id },
                }
            });

        const formatedNotifications = notifications.filter(
            notification => notification.exam.patient !== null);
        const sortedNotifications = formatedNotifications.sort(
            (a, b) => b.exam.date - a.exam.date);

        res.json(sortedNotifications);
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


module.exports = router;