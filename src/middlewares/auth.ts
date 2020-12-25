import { MyContext } from "../utils/types";
import { ErrorResponse } from '../utils/ErrorResponse';
import { MiddlewareFn } from "type-graphql";
import { NOT_AUTHENTICATED, NOT_AUTHORIZED } from "../utils/constants";


export const isAuthenticated: MiddlewareFn<MyContext> = ( { context }, next ) =>
{
    const currentUser = context.session?.user;

    if ( !currentUser )
    {
        throw new ErrorResponse( NOT_AUTHENTICATED, 401 );
    }
    return next();
};

export const isFree: MiddlewareFn<MyContext> = ( { context }, next ) =>
{
    const currentUser = context.session?.user;

    if ( currentUser )
    {
        throw new ErrorResponse( NOT_AUTHORIZED, 401 );
    }
    return next();
};