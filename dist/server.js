"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express6 = __toESM(require("express"));
var import_mongoose7 = __toESM(require("mongoose"));

// src/routes/users.ts
var import_express = __toESM(require("express"));

// src/models/User.ts
var import_mongoose = __toESM(require("mongoose"));
var import_bcrypt = __toESM(require("bcrypt"));
var userSchema = new import_mongoose.default.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true
  }
});
userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await import_bcrypt.default.hash(this.password, 10);
  }
  next();
});
var User_default = import_mongoose.default.model("User", userSchema);

// src/routes/users.ts
var router = import_express.default.Router();
router.get("/", async (_req, res) => {
  try {
    const users = await User_default.find();
    res.json(users);
  } catch {
    res.sendStatus(500);
  }
});
router.get("/:id", getUser, (_req, res) => {
  res.json(res.user);
});
router.post("/", async (req, res) => {
  const newUser = new User_default({
    email: req.body.email,
    password: req.body.password
  });
  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch {
    res.sendStatus(400);
  }
});
router.patch("/:id", getUser, async (req, res) => {
  if (req.body.email) {
    res.user.email = req.body.email;
  }
  if (req.body.password) {
    res.user.password = req.body.password;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch {
    res.sendStatus(400);
  }
});
router.delete("/:id", getUser, async (_req, res) => {
  try {
    await res.user.deleteOne();
    res.json({ message: "Deleted user" });
  } catch {
    res.sendStatus(500);
  }
});
async function getUser(req, res, next) {
  let user;
  try {
    user = await User_default.findById(req.params.id);
    if (!user) {
      return res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
  res.user = user;
  next();
}
var users_default = router;

// src/routes/patients.ts
var import_express2 = __toESM(require("express"));

// src/middlewares/authenticateToken.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.sendStatus(401);
  try {
    const user = import_jsonwebtoken.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
}
var authenticateToken_default = authenticateToken;

// src/models/Patient.ts
var import_mongoose2 = __toESM(require("mongoose"));
var patientSchema = new import_mongoose2.default.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  species: {
    type: String,
    enum: ["canina", "felina"],
    required: true,
    lowercase: true
  },
  breed: {
    type: String,
    lowercase: true
  },
  tutorName: {
    type: String,
    required: true,
    lowercase: true
  },
  pictureUrl: String,
  healthDescription: String,
  birthdate: Date,
  user: {
    type: import_mongoose2.default.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  }
});
var Patient_default = import_mongoose2.default.model("Patient", patientSchema);

// src/models/Exam.ts
var import_mongoose3 = __toESM(require("mongoose"));
var examSchema = new import_mongoose3.default.Schema({
  type: {
    type: String,
    required: true,
    lowercase: true
  },
  unit: String,
  date: {
    type: Date,
    required: true
  },
  result: {
    type: Number,
    required: true
  },
  patient: {
    type: import_mongoose3.default.SchemaTypes.ObjectId,
    ref: "Patient",
    required: true
  }
});
var Exam_default = import_mongoose3.default.model("Exam", examSchema);

// src/routes/patients.ts
var router2 = import_express2.default.Router();
router2.get("/:id/exams", async (req, res) => {
  try {
    const exams = await Exam_default.find({ patient: req.params.id }).sort({ date: 1 });
    res.json(exams);
  } catch {
    res.sendStatus(500);
  }
});
router2.get("/", authenticateToken_default, async (req, res) => {
  try {
    const patients = await Patient_default.find({ user: req.user.id });
    res.json(patients);
  } catch {
    res.sendStatus(500);
  }
});
router2.get("/:id", authenticateToken_default, getPatient, (_req, res) => {
  res.json(res.patient);
});
router2.post("/", authenticateToken_default, async (req, res) => {
  const newPatient = new Patient_default({
    name: req.body.name,
    species: req.body.species,
    breed: req.body.breed,
    birthdate: req.body.birthdate,
    user: req.user.id,
    tutorName: req.body.tutorName,
    pictureUrl: req.body.pictureUrl,
    healthDescription: req.body.healthDescription
  });
  try {
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch {
    res.sendStatus(400);
  }
});
router2.patch("/:id", authenticateToken_default, getPatient, async (req, res) => {
  if (req.body.name) {
    res.patient.name = req.body.name;
  }
  if (req.body.species) {
    res.patient.species = req.body.species;
  }
  if (req.body.breed) {
    res.patient.breed = req.body.breed;
  }
  if (req.body.birthdate) {
    res.patient.birthdate = req.body.birthdate;
  }
  if (req.body.tutorName) {
    res.patient.tutorName = req.body.tutorName;
  }
  if (req.body.pictureUrl) {
    res.patient.pictureUrl = req.body.pictureUrl;
  }
  if (req.body.healthDescription) {
    res.patient.healthDescription = req.body.healthDescription;
  }
  try {
    const updatedPatient = await res.patient.save();
    res.json(updatedPatient);
  } catch {
    res.sendStatus(400);
  }
});
router2.delete("/:id", authenticateToken_default, getPatient, async (_req, res) => {
  try {
    await res.patient.deleteOne();
    res.json({ message: "Deleted patient" });
  } catch {
    res.sendStatus(500);
  }
});
async function getPatient(req, res, next) {
  let patient;
  try {
    patient = await Patient_default.findOne({ _id: req.params.id, user: req.user.id });
    if (!patient) {
      return res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
  res.patient = patient;
  next();
}
var patients_default = router2;

// src/routes/exams.ts
var import_express3 = __toESM(require("express"));
var import_mongoose5 = __toESM(require("mongoose"));
var import_multer = __toESM(require("multer"));
var import_pdf = require("pdf.js-extract");

// src/models/Notification.ts
var import_mongoose4 = __toESM(require("mongoose"));
var notificationSchema = new import_mongoose4.default.Schema({
  message: String,
  status: {
    type: String,
    enum: ["UNREAD", "READ"],
    // todo: change to a boolean (unread)
    default: "UNREAD"
  },
  exam: {
    type: import_mongoose4.default.SchemaTypes.ObjectId,
    ref: "Exam",
    required: true
  }
});
var Notification_default = import_mongoose4.default.model("Notification", notificationSchema);

// src/routes/exams.ts
var router3 = import_express3.default.Router();
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage() });
router3.post("/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  if (!file || file.mimetype !== "application/pdf") {
    return res.sendStatus(400);
  }
  const session = await import_mongoose5.default.startSession();
  session.startTransaction();
  try {
    const patient = await Patient_default.findById(req.body.patient);
    if (!patient) {
      return res.sendStatus(404);
    }
    const extractedData = await extractPdfData(file.buffer);
    const newExams = extractedData.exams.map((exam) => new Exam_default({
      type: exam.type,
      unit: exam.unit,
      date: extractedData.date,
      result: exam.result,
      patient: req.body.patient
    }));
    const newNotifications = [];
    newExams.forEach((exam) => {
      const notificationMessage = generateNotificationMessage(exam, patient.species);
      if (notificationMessage) {
        newNotifications.push(new Notification_default({
          message: notificationMessage,
          exam: exam.id
        }));
      }
    });
    await Exam_default.insertMany(newExams, { session });
    await Notification_default.insertMany(newNotifications, { session });
    await session.commitTransaction();
    res.status(201).json({ newExams, newNotifications });
  } catch (error) {
    await session.abortTransaction();
    res.sendStatus(400);
  } finally {
    session.endSession();
  }
});
router3.post("/", async (req, res) => {
  try {
    const patient = await Patient_default.findById(req.body.patient);
    if (!patient) {
      return res.sendStatus(404);
    }
    const newExam = new Exam_default({
      type: req.body.type,
      unit: req.body.unit,
      date: req.body.date,
      result: req.body.result,
      patient: req.body.patient
    });
    const notificationMessage = generateNotificationMessage(newExam, patient.species);
    if (notificationMessage) {
      const newNotification = new Notification_default({
        message: notificationMessage,
        exam: newExam.id
      });
      const session = await import_mongoose5.default.startSession();
      session.startTransaction();
      try {
        await newExam.save({ session });
        await newNotification.save({ session });
        await session.commitTransaction();
        res.status(201).json({ newExam, newNotification });
      } catch {
        await session.abortTransaction();
        res.sendStatus(400);
      } finally {
        session.endSession();
      }
    } else {
      await newExam.save();
      res.status(201).json({ newExam, newNotification: null });
    }
  } catch (error) {
    res.sendStatus(500);
  }
});
router3.patch("/:id", getExam, async (req, res) => {
  if (req.body.type) {
    res.exam.type = req.body.type;
  }
  if (req.body.date) {
    res.exam.date = req.body.date;
  }
  if (req.body.result) {
    res.exam.result = req.body.result;
  }
  if (req.body.patient) {
    res.exam.patient = req.body.patient;
  }
  try {
    const updatedExam = await res.exam.save();
    res.json(updatedExam);
  } catch {
    res.sendStatus(400);
  }
});
router3.delete("/:id", getExam, async (_req, res) => {
  try {
    await res.exam.deleteOne();
    res.json({ message: "Deleted exam" });
  } catch {
    res.sendStatus(500);
  }
});
async function getExam(req, res, next) {
  let exam;
  try {
    exam = await Exam_default.findById(req.params.id);
    if (!exam) {
      return res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
  res.exam = exam;
  next();
}
function getExamLimits(examType, species) {
  const catLimits = {
    "s\xF3dio": { unit: "mEq/L", min: 145.8, max: 158.7 },
    "cloreto": { unit: "mEq/L", min: 107.5, max: 129.6 },
    "pot\xE1ssio": { unit: "mEq/L", min: 3.8, max: 5.3 },
    "c\xE1lcio total": { unit: "mg/dL", min: 7.9, max: 10.9 },
    "c\xE1lcio ionizado": { unit: "mmol/L", min: 1.1, max: 1.4 },
    "f\xF3sforo": { unit: "mg/dL", min: 4, max: 7.3 },
    "magn\xE9sio": { unit: "mg/dL", min: 1.9, max: 2.8 },
    "press\xE3o arterial": { unit: "mmHg", min: 120, max: 140 },
    "ureia": { unit: "mg/dL", min: void 0, max: 60 },
    "densidade urin\xE1ria": { unit: void 0, min: 1.035, max: void 0 },
    "creatinina": { unit: "mg/dL", min: void 0, max: 1.6 }
  };
  const dogLimits = {
    "s\xF3dio": { unit: "mEq/L", min: 140.3, max: 159.9 },
    "cloreto": { unit: "mEq/L", min: 102.1, max: 117.4 },
    "pot\xE1ssio": { unit: "mEq/L", min: 3.8, max: 5.6 },
    "c\xE1lcio total": { unit: "mg/dL", min: 8.7, max: 11.8 },
    "c\xE1lcio ionizado": { unit: "mmol/L", min: 1.18, max: 1.4 },
    "f\xF3sforo": { unit: "mg/dL", min: 2.9, max: 6.2 },
    "magn\xE9sio": { unit: "mg/dL", min: 1.7, max: 2.7 },
    "press\xE3o arterial": { unit: "mmHg", min: 120, max: 140 },
    "ureia": { unit: "mg/dL", min: void 0, max: 60 },
    "densidade urin\xE1ria": { unit: void 0, min: 1.015, max: void 0 },
    "creatinina": { unit: "mg/dL", min: void 0, max: 1.4 }
  };
  if (species === "felina") {
    return catLimits[examType];
  } else if (species === "canina") {
    return dogLimits[examType];
  }
}
function generateNotificationMessage(exam, animalSpecies) {
  const examLimits = getExamLimits(exam.type, animalSpecies);
  if (!examLimits)
    return void 0;
  let message = `${exam.type}`;
  switch (exam.type) {
    case "albumina":
    case "creatinina":
      message += ` s\xE9rica`;
      break;
    case "f\xF3sforo":
    case "s\xF3dio":
    case "pot\xE1ssio":
    case "cloreto":
    case "magn\xE9sio":
      message += ` s\xE9rico`;
      break;
  }
  if (examLimits.min && exam.result < examLimits.min) {
    return `${message} < ${examLimits.min}${examLimits.unit ? ` ${examLimits.unit}` : ``}`;
  } else if (examLimits.max && exam.result > examLimits.max) {
    return `${message} > ${examLimits.max}${examLimits.unit ? ` ${examLimits.unit}` : ``}`;
  } else {
    return void 0;
  }
}
async function extractPdfData(buffer) {
  const DATA = ["albumina", "globulinas", "ureia", "ur\xE9ia", "creatinina"];
  let extractedData = { date: "", exams: [] };
  const pdfExtract = new import_pdf.PDFExtract();
  const options = {};
  try {
    const data = await pdfExtract.extractBuffer(buffer, options);
    const page1Content = data.pages[0].content;
    page1Content.forEach((value, index) => {
      const stringValue = value.str.toLowerCase();
      if (stringValue === "data de entrada:") {
        extractedData.date = formatDateString(page1Content[index - 1].str);
      }
      const found = DATA.some((key) => stringValue.match(key) !== null);
      if (found) {
        const formattedType = stringValue === "ur\xE9ia" ? "ureia" : stringValue;
        extractedData.exams.push({
          type: formattedType,
          unit: page1Content[index + 2].str,
          result: Number(
            page1Content[index + 5].str.replace(",", ".")
          )
        });
      }
    });
    return extractedData;
  } catch (error) {
    throw error;
  }
}
function formatDateString(date) {
  const parts = date.split("/");
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
var exams_default = router3;

// src/routes/notifications.ts
var import_express4 = __toESM(require("express"));
var import_mongoose6 = __toESM(require("mongoose"));
var router4 = import_express4.default.Router();
router4.get("/", authenticateToken_default, async (req, res) => {
  try {
    const notifications = await Notification_default.aggregate([
      {
        "$lookup": {
          "from": "exams",
          "localField": "exam",
          "foreignField": "_id",
          "as": "exam"
        }
      },
      {
        "$unwind": {
          "path": "$exam"
        }
      },
      {
        "$lookup": {
          "from": "patients",
          "localField": "exam.patient",
          "foreignField": "_id",
          "as": "exam.patient"
        }
      },
      {
        "$unwind": {
          "path": "$exam.patient"
        }
      },
      {
        "$match": {
          "exam.patient.user": new import_mongoose6.default.Types.ObjectId(req.user.id)
        }
      },
      {
        "$sort": {
          "exam.date": -1
        }
      }
    ]);
    res.json(notifications);
  } catch {
    res.sendStatus(500);
  }
});
router4.delete("/delete-many", authenticateToken_default, async (req, res) => {
  try {
    const result = await Notification_default.deleteMany({ _id: { $in: req.body.ids } });
    if (result.deletedCount === 0) {
      return res.sendStatus(404);
    }
    res.json({ message: `${result.deletedCount} records deleted` });
  } catch {
    res.sendStatus(500);
  }
});
router4.put("/update-many-notification-status", authenticateToken_default, async (req, res) => {
  try {
    const result = await Notification_default.updateMany(
      { _id: { $in: req.body.ids } },
      { $set: { status: "READ" } }
    );
    if (result.matchedCount === 0) {
      return res.sendStatus(404);
    }
    res.json({ message: `${result.modifiedCount} records updated` });
  } catch {
    res.sendStatus(500);
  }
});
var notifications_default = router4;

// src/routes/auth.ts
var import_express5 = __toESM(require("express"));
var import_bcrypt2 = __toESM(require("bcrypt"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var router5 = import_express5.default.Router();
router5.post("/login", async (req, res) => {
  try {
    const user = await User_default.findOne({ email: req.body.email }).select("+password").exec();
    if (!user) {
      return res.sendStatus(404);
    }
    if (!await import_bcrypt2.default.compare(req.body.password, user.password)) {
      return res.sendStatus(401);
    }
    const authData = { id: user.id, email: user.email };
    const accessToken = import_jsonwebtoken2.default.sign(authData, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken });
  } catch {
    res.sendStatus(500);
  }
});
router5.delete("/logout", async (req, res) => {
  res.json({ message: "todo: logout" });
});
var auth_default = router5;

// src/server.ts
var app = (0, import_express6.default)();
app.use(import_express6.default.json());
import_mongoose7.default.connect(process.env.DATABASE_URL);
var db = import_mongoose7.default.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));
app.use("/users", users_default);
app.use("/patients", patients_default);
app.use("/exams", exams_default);
app.use("/notifications", notifications_default);
app.use("/auth", auth_default);
app.listen(process.env.PORT, () => console.log("Server started"));
