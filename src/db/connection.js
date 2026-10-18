import mongoose from 'mongoose';
import dns from "node:dns/promises";

dns.setServers(['1.1.1.1', '8.8.8.8']);

export const database_connect = async () => {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database connected successfully");
}

// import { MongoClient } from 'mongodb';

// const client = new MongoClient('mongodb://localhost:27017');

// export const db = client.db('social_media');

// export const database_connect = async () => {
//     try {
//         await client.connect();
//         console.log("Database connected successfully");
//     } catch (error) {
//         console.error("Error connecting to database:", error);
//     }
// }