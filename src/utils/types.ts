import { Request, Response } from "express";
import { ISession } from "./interfaces";

export type MyContext = {
    req: Request,
    res: Response,
    session: ISession;
};