import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { getSchema } from './utils/getSchema';
import dotenv from 'dotenv';
import 'colors';
import { createConnection } from 'typeorm';
import { isProd } from './utils/constants';
import { UserEntity } from './entities/User';
import session from 'express-session';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import { MyContext } from './utils/types';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const main = async () =>
{
    dotenv.config( { path: '.env.local' } );

    const RedisClient = new Redis();
    const RedisStore = connectRedis( session );

    await createConnection( {
        type: 'postgres',
        database: 'airbnb',
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        entities: [ UserEntity ],
        synchronize: true,
        logging: !isProd()
    } );

    console.log( `Postgres is here`.blue.bold );

    const app = express();

    app.use( cors( {
        credentials: true,
        origin: isProd() ? process.env.CLIENT_URL : 'http://localhost:3000'
    } ) );

    app.use( rateLimit( {
        windowMs: 10 * 60 * 1000,   // Max 100 reqs per 10 minutes
        max: 100
    } ) );

    app.use( session( {
        store: new RedisStore( { client: RedisClient } ),
        name: 'airbnb',
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: 'lax',
            httpOnly: true,
            secure: isProd(),
            domain: isProd() ? process.env.DOMAIN : undefined,
            maxAge: 1000 * 60 * 60 * 24     // 1 day
        }
    } ) );

    const apolloServer = new ApolloServer( {
        schema: await getSchema(),
        context: ( { req, res } ): MyContext => ( { req, res, session: req?.session } )
    } );

    apolloServer.applyMiddleware( { app } );

    const PORT = process.env.PORT || 5000;
    app.listen( PORT, () =>
    {
        console.log( `Server started on port ${ PORT }`.green.bold );
    } );
};

main().catch( err => console.error( err ) );