export const devLogger = ( data: any ) =>
{
    if ( process.env.NODE_ENV !== 'development' )
    {
        return;
    }
    console.log( data );
}