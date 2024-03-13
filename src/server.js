require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use(express.json());

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
const patientsRouter = require('./routes/patients');
app.use('/patients', patientsRouter);
const examsRouter = require('./routes/exams');
app.use('/exams', examsRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

app.listen(process.env.PORT, () => console.log('Server started'));