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

// src/models/Patient.ts
var Patient_exports = {};
__export(Patient_exports, {
  default: () => Patient_default
});
module.exports = __toCommonJS(Patient_exports);
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
