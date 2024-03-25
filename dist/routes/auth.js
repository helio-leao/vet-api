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

// src/routes/auth.ts
var auth_exports = {};
__export(auth_exports, {
  default: () => auth_default
});
module.exports = __toCommonJS(auth_exports);
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

// src/routes/auth.ts
var import_bcrypt2 = __toESM(require("bcrypt"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var router = import_express.default.Router();
router.post("/login", async (req, res) => {
  try {
    const user = await User_default.findOne({ email: req.body.email }).select("+password").exec();
    if (!user) {
      return res.sendStatus(404);
    }
    if (!await import_bcrypt2.default.compare(req.body.password, user.password)) {
      return res.sendStatus(401);
    }
    const authData = { id: user.id, email: user.email };
    const accessToken = import_jsonwebtoken.default.sign(authData, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/logout", async (req, res) => {
  res.json({ message: "todo: logout" });
});
var auth_default = router;
