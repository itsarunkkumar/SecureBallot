import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config(); 

const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('DB Connected');
});

db.on('error', (err) => {
    console.log('DB connection error:', err);
});

db.on('disconnected', () => {
    console.log('DB Disconnected');
});

export default db;
