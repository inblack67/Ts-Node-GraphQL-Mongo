import { MyContext } from "../utils/types";
import { Ctx, Mutation, Query, UseMiddleware, Resolver, Arg } from "type-graphql";
import { isAuthenticated, isFree } from '../middlewares/auth';
import { UserEntity } from "../entities/User";
import argon from 'argon2';
import { ErrorResponse } from "../utils/ErrorResponse";
import { NOT_AUTHENTICATED, INVALID_CREDENTIALS } from "../utils/constants";

@Resolver()
export class AuthResolver
{
    @UseMiddleware( isAuthenticated )
    @Query( () => UserEntity )
    async getMe (
        @Ctx()
        { session }: MyContext
    ): Promise<UserEntity | undefined>
    {

        const currentUser = await UserEntity.findOne( { id: session.user as number } );

        return currentUser;
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
        @Arg( 'password' )
        password: string
    ): Promise<UserEntity>
    {
        const hashedPassword = await argon.hash( password );
        const newUser = await UserEntity.create( { name, email, password: hashedPassword } ).save();

        session.user = newUser.id;

        return newUser;
    }

    @UseMiddleware( isFree )
    @Mutation( () => UserEntity )
    async loginUser (
        @Arg( 'email' )
        email: string,
        @Arg( 'password' )
        password: string,
        @Ctx()
        { session }: MyContext
    ): Promise<UserEntity>
    {
        const user = await UserEntity.findOne( { email } );

        if ( !user )
        {
            throw new ErrorResponse( INVALID_CREDENTIALS, 401 );

        }

        const isValidPassword = await argon.verify( user.password, password );

        if ( !isValidPassword )
        {
            throw new ErrorResponse( INVALID_CREDENTIALS, 401 );
        }

        session.user = user.id;

        return user;
    }

    @UseMiddleware( isAuthenticated )
    @Mutation( () => Boolean )
    async logoutUser (
        @Ctx()
        { session }: MyContext
    ): Promise<boolean>
    {
        const user = await UserEntity.findOne( session.user );

        if ( !user )
        {
            throw new ErrorResponse( NOT_AUTHENTICATED, 401 );
        }

        session.destroy( err =>
        {
            if ( err )
            {
                console.log( `Session destruction error:`.red.bold );
                console.error( err );
            }
        } );

        return true;
    }

}