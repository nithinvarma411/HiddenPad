import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

const app = express();
const isDev = process.env.NODE_ENV == 'development';
app.use(cors({
    origin: isDev ? 'http://localhost:5173' : false,
    credentials: true
}))

app.use(express.json());
const PORT = process.env.PORT || 3894;

import notesrouter from './routes/notes.routes.js'
import { attachDeviceId } from './middlewares/deviceid.middleware.js';

app.use("/api/v1/notes", attachDeviceId, notesrouter);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });