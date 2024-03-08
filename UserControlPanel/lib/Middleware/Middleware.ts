import { NextApiRequest, NextApiResponse } from "next";

const middleware = (handler: any, checkAdmin: boolean, checkAuth: boolean, method: string) => async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== method) return res.status(405).send({
        status: false,
        error: 405,
        desc: "This endpoint requires a " + method
    });

    return handler(req, res);
}

export default middleware;