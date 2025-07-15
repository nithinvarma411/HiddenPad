import { Router } from 'express';
import { addNotes, addTitle, getTitle, getNoteByTitle, deleteNote } from '../controllers/notes.controller.js';

const router = Router();

router.route("/addtitle").post(addTitle);
router.route("/gettitle").get(getTitle);
router.route("/addnotes").put(addNotes);
router.route("/getnote").get(getNoteByTitle);
router.route("/deletenote").delete(deleteNote);

export default router;