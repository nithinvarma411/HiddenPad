import { Router } from 'express';
import { addNotes, addTitle, getTitle } from '../controllers/notes.controller.js';

const router = Router();

router.route("/addtitle").post(addTitle);
router.route("/gettitle").get(getTitle);
router.route("/addnotes").put(addNotes);

export default router;