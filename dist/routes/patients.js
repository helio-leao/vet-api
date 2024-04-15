"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/patients.ts
var patients_exports = {};
__export(patients_exports, {
  default: () => patients_default
});
module.exports = __toCommonJS(patients_exports);
var import_express = __toESM(require("express"));

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
var import_mongoose = __toESM(require("mongoose"));
var patientSchema = new import_mongoose.default.Schema({
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
    type: import_mongoose.default.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  }
});
var Patient_default = import_mongoose.default.model("Patient", patientSchema);

// src/models/Exam.ts
var import_mongoose2 = __toESM(require("mongoose"));
var examSchema = new import_mongoose2.default.Schema({
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
    type: import_mongoose2.default.SchemaTypes.ObjectId,
    ref: "Patient",
    required: true
  }
});
var Exam_default = import_mongoose2.default.model("Exam", examSchema);

// src/routes/patients.ts
var router = import_express.default.Router();
router.get("/:id/exams", async (req, res) => {
  try {
    const exams = await Exam_default.find({ patient: req.params.id }).sort({ date: 1 });
    res.json(exams);
  } catch {
    res.sendStatus(500);
  }
});
router.get("/", authenticateToken_default, async (req, res) => {
  try {
    const patients = await Patient_default.find({ user: req.user.id });
    res.json(patients);
  } catch {
    res.sendStatus(500);
  }
});
router.get("/:id", authenticateToken_default, getPatient, (_req, res) => {
  res.json(res.patient);
});
router.post("/", authenticateToken_default, async (req, res) => {
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
router.patch("/:id", authenticateToken_default, getPatient, async (req, res) => {
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
router.delete("/:id", authenticateToken_default, getPatient, async (_req, res) => {
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
var patients_default = router;
