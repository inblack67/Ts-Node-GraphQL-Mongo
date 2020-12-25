import { Session, SessionData } from 'express-session';

export interface ISession extends Session, SessionData 
{
    user?: string | number;
}