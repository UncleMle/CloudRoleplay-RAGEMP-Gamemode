import { HttpStatusCodes } from "@/utilClasses";
import { NextApiResponse } from "next";

export default function apiErrorHandle(res: NextApiResponse, errorCode: HttpStatusCodes) {
    console.log("[API] Endpoint failed code " + errorCode);

    res.status(errorCode as number).send({
        status: false,
        code: errorCode,
        error: "An api exception was thrown whilst delivering the endpoint. Code " + errorCode
    });
}