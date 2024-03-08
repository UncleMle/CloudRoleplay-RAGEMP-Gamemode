import { NextApiRequest, NextApiResponse } from "next";
import AccountsController from "../AccountController/AccountController";
import { HttpStatusCode } from "axios";
import { HttpStatusCodes } from "@/utilClasses";

const middleware = (handler: any, checkAdmin: boolean, checkAuth: boolean, method: string) => async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method !== method) return res.status(405).send({
        status: false,
        error: 405,
        desc: "This endpoint requires a " + method
    });

    if (checkAuth && !await AccountsController.tokenAuthentication(req.headers['x-auth-token'])) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).send({
            status: false,
            code: HttpStatusCodes.UNAUTHORIZED,
            error: "You aren't authorized to access this resource."
        })
    }

    return handler(req, res);
}

export default middleware;