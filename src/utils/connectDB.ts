import mongoose from 'mongoose';
import { devLogger } from './dev';

export const connectDB = async () =>
{
    await mongoose.connect( process.env.MONGO_URI, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    } );
    devLogger( `Mongo is here`.blue.bold );
};