import { getModelForClass, prop } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { v4 } from 'uuid';

@ObjectType()
export class UserEntity
{
    @Field( () => String )
    @prop( { default: v4() } )
    id: string;

    @Field( () => String )
    @prop( { required: true } )
    name: string;

    @Field( () => String )
    @prop( { unique: true, required: true } )
    email: string;

    @Field( () => String )
    @prop( { unique: true, required: true } )
    username: string;

    @Field( () => Date )
    @prop( { default: new Date() } )
    createdAt: Date;

    @prop( { minlength: [ 8, 'Password must be 8 chars at min' ] } )
    password: string;
}

export const UserModel = getModelForClass( UserEntity );