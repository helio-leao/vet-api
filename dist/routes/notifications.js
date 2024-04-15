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

// src/routes/notifications.ts
var notifications_exports = {};
__export(notifications_exports, {
  default: () => notifications_default
});
module.exports = __toCommonJS(notifications_exports);
var import_express = __toESM(require("express"));
var import_mongoose2 = __toESM(require("mongoose"));

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

// src/models/Notification.ts
var import_mongoose = __toESM(require("mongoose"));
var notificationSchema = new import_mongoose.default.Schema({
  message: String,
  status: {
    type: String,
    enum: ["UNREAD", "READ"],
    // todo: change to a boolean (unread)
    default: "UNREAD"
  },
  exam: {
    type: import_mongoose.default.SchemaTypes.ObjectId,
    ref: "Exam",
    required: true
  }
});
var Notification_default = import_mongoose.default.model("Notification", notificationSchema);

// src/routes/notifications.ts
var router = import_express.default.Router();
router.get("/", authenticateToken_default, async (req, res) => {
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
          "exam.patient.user": new import_mongoose2.default.Types.ObjectId(req.user.id)
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
router.delete("/delete-many", authenticateToken_default, async (req, res) => {
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
router.put("/update-many-notification-status", authenticateToken_default, async (req, res) => {
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
var notifications_default = router;
