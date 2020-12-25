import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class UserEntity extends BaseEntity
{

    @Field( () => Number )
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column( { unique: true } )
    email: string;

    @Column()
    password: string;

    @Field( () => String )
    @CreateDateColumn()
    createdAt: Date;

}