import { Schema, model } from "mongoose";

const notesSchema = new Schema({
    deviceId: String, 
    title: String,
    notes: String
}, {timestamps: true});

export const Note = model("Note", notesSchema);