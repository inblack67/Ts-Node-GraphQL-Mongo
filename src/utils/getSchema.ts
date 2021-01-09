import { HelloResolver } from "../resolvers/hello";
import { buildSchema } from "type-graphql";
import { AuthResolver } from "../resolvers/auth";
import { CountResolver } from "../resolvers/count";

export const getSchema = async () =>
{
    const schema = await buildSchema( {
        resolvers: [ HelloResolver, AuthResolver, CountResolver ],
        validate: false,
    } );

    return schema;
};