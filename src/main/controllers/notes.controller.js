import { Note } from "../models/notes.model.js";

const addTitle = async (req, res) => {
  try {
    const { title } = req.body;
    const deviceId = req.user.deviceId; // from middleware

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Only check for existing titles for this device
    const titleExist = await Note.findOne({ deviceId, title });

    if (titleExist) {
      return res.status(409).json({ message: "Title already exists" });
    }

    const newTitle = new Note({
      deviceId,
      title,
      notes: ""
    });

    await newTitle.save();

    return res.status(200).json({ message: "Title saved successfully" });

  } catch (error) {
    console.error("Error adding title:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getTitle = async (req, res) => {
    try {
        const deviceId = req.user.deviceId;

        const titles = await Note.find({deviceId}).select('title'); // <-- add await

        return res.status(200).send({titles, "message": "Titles retrived successfully"});
    } catch (error) {
        console.error("error retriving titles", error);
        return res.status(500).send({"message": "Internal Server Error"});
    }
};

const addNotes = async (req, res) => {
  try {
    const deviceId = req.user.deviceId;
    const { title, notes } = req.body;

    if (!title || !notes) {
      return res.status(400).send({"message": "Title and Notes are required"});
    }

    const updatedNote = await Note.findOneAndUpdate(
      { deviceId, title },
      { $set: { notes } },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).send({ "message": "Note not found" });
    };

    return res.status(200).send({"message": "Notes saved successfully", notes: updatedNote});
  } catch (error) {
    console.error("error adding notes", error);
    return res.status(500).send({"message": "Internal Server Error"});
  }
};

export { addTitle, getTitle, addNotes };