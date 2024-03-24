import express from 'express';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import patientsRouter from './routes/patients';
import examsRouter from './routes/exams';
import notificationsRouter from './routes/notifications';
import authRouter from './routes/auth';

const app = express();

app.use(express.json());

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use('/users', usersRouter);
app.use('/patients', patientsRouter);
app.use('/exams', examsRouter);
app.use('/notifications', notificationsRouter);
app.use('/auth', authRouter);

app.listen(process.env.PORT, () => console.log('Server started'));