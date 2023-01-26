import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

async function connect() {
    const mongod = await MongoMemoryServer.create(); // new mongodb instance is created whenever server gets started
    const getUri = mongod.getUri();

    mongoose.set('strictQuery', true);
    const db = await mongoose.connect(getUri);

    console.log("Database connected");

    return db;
}

export default connect;