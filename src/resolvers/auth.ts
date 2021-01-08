import { MyContext } from "../utils/types";
import { Ctx, Mutation, Query, UseMiddleware, Resolver, Arg } from "type-graphql";
import { isAuthenticated, isFree } from '../middlewares/auth';
import { UserEntity, UserModel } from "../entities/User";
import argon from 'argon2';
import { ErrorResponse } from "../utils/ErrorResponse";
import { INVALID_CREDENTIALS } from "../utils/constants";
import { devLogger } from "../utils/dev";

@Resolver()
export class AuthResolver
{
    @UseMiddleware( isAuthenticated )
    @Query( () => UserEntity )
    async getMe (
        @Ctx()
        { session }: MyContext
    )
    {
        const user = await UserModel.findById( session.user );
        return user;
    }

    @UseMiddleware( isFree )
    @Mutation( () => UserEntity )
    async registerUser (
        @Ctx()
        { session }: MyContext,
        @Arg( 'name' )
        name: string,
        @Arg( 'email' )
        email: string,
        @Arg( 'username' )
        username: string,
        @Arg( 'password' )
        password: string
    )
    {
        const hashedPassword = await argon.hash( password );

        const newUser = await UserModel.create( { name, username, email, password: hashedPassword } as UserEntity );

        session.user = newUser._id;
        session.username = newUser.username;

        return newUser;
    }

    @UseMiddleware( isFree )
    @Mutation( () => UserEntity )
    async loginUser (
        @Arg( 'username' )
        username: string,
        @Arg( 'password' )
        password: string,
        @Ctx()
        { session }: MyContext
    )
    {
        const user = await UserModel.findOne( { username } );

        if ( !user )
        {
            throw new ErrorResponse( INVALID_CREDENTIALS, 401 );

        }

        const isValidPassword = await argon.verify( user.password, password );

        if ( !isValidPassword )
        {
            throw new ErrorResponse( INVALID_CREDENTIALS, 401 );
        }

        session.user = user._id;
        session.username = user.username;

        return user;
    }

    @UseMiddleware( isAuthenticated )
    @Mutation( () => Boolean )
    async logoutUser (
        @Ctx()
        { session }: MyContext
    )
    {
        session.destroy( err =>
        {
            if ( err )
            {
                devLogger( `Session destruction error:`.red.bold );
                throw err;
            }
        } );

        return true;
    }

}