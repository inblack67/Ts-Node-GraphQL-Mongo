import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { getSchema } from './utils/getSchema';
import dotenv from 'dotenv-safe';
import 'colors';
import { isProd } from './utils/constants';
import session from 'express-session';
import { MyContext } from './utils/types';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectMongo from 'connect-mongo';
import { connectDB } from './utils/connectDB';
import mongoose from 'mongoose';
import { devLogger } from './utils/dev';

const main = async () =>
{
    dotenv.config();

    await connectDB();

    const MongoStore = connectMongo( session );

    const app = express();

    app.use( cors( {
        credentials: true,
        origin: isProd() ? process.env.CLIENT_URL : 'http://localhost:3000'
    } ) );

    app.use( rateLimit( {
        windowMs: 10 * 60 * 1000,   // Max 100 reqs per 10 minutes
        max: 100
    } ) );

    app.get( '/', ( _: Request, res: Response ) =>
    {
        res.send( 'API up and runnin' );
        res.end();
    } );

    app.use( session( {
        store: new MongoStore( { mongooseConnection: mongoose.connection } ),
        name: 'ts',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: 'none',
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24     // 1 day
        }
    } ) );

    const apolloServer = new ApolloServer( {
        schema: await getSchema(),
        context: ( { req, res } ): MyContext => ( { req, res, session: req.session } ),
        playground: {
            settings: {
                "request.credentials": "include"
            }
        }
    } );

    apolloServer.applyMiddleware( { app } );

    const PORT = process.env.PORT || 5000;
    app.listen( PORT, () =>
    {
        devLogger( `Server started on port ${ PORT }`.green.bold );
    } );
};

main().catch( err => console.error( err ) );