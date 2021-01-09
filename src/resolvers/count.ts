import { PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";
import { COUNT } from "../utils/constants";

@Resolver()
export class CountResolver
{
    @Query( () => String )
    count (
        @PubSub()
        pubsub: PubSubEngine
    )
    {
        let count = 0;
        setInterval( () =>
        {
            count += 1;
            pubsub.publish( COUNT, {
                count
            } );
        }, 1000 );
        return count;
    }

    @Subscription( () => Number, {
        topics: COUNT
    } )
    update (
        @Root()
        payload: any
    )
    {
        return payload.count;
    }

} 