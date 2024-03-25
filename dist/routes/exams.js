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

// src/routes/exams.ts
var exams_exports = {};
__export(exams_exports, {
  default: () => exams_default
});
module.exports = __toCommonJS(exams_exports);
var import_express = __toESM(require("express"));
var import_mongoose3 = __toESM(require("mongoose"));

// src/models/Exam.ts
var import_mongoose = __toESM(require("mongoose"));
var examSchema = new import_mongoose.default.Schema({
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
    type: import_mongoose.default.SchemaTypes.ObjectId,
    ref: "Patient",
    required: true
  }
});
var Exam_default = import_mongoose.default.model("Exam", examSchema);

// src/models/Notification.ts
var import_mongoose2 = __toESM(require("mongoose"));
var notificationSchema = new import_mongoose2.default.Schema({
  message: String,
  status: {
    type: String,
    enum: ["UNREAD", "READ"],
    default: "UNREAD"
  },
  exam: {
    type: import_mongoose2.default.SchemaTypes.ObjectId,
    ref: "Exam",
    required: true
  }
});
var Notification_default = import_mongoose2.default.model("Notification", notificationSchema);

// src/routes/exams.ts
var router = import_express.default.Router();
router.post("/", async (req, res) => {
  const newExam = new Exam_default({
    type: req.body.type,
    unit: req.body.unit,
    date: req.body.date,
    result: req.body.result,
    patient: req.body.patient
  });
  const newNotification = new Notification_default({
    message: `Taxa de ${newExam.type} atualizada para ${newExam.result} ${newExam.unit}`,
    exam: newExam.id
  });
  const session = await import_mongoose3.default.startSession();
  session.startTransaction();
  try {
    await newExam.save({ session });
    await newNotification.save({ session });
    await session.commitTransaction();
    res.status(201).json(newExam);
  } catch {
    await session.abortTransaction();
    res.sendStatus(400);
  } finally {
    session.endSession();
  }
});
router.patch("/:id", getExam, async (req, res) => {
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
router.delete("/:id", getExam, async (_req, res) => {
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
var exams_default = router;
