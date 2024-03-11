import AccountsController from "@/lib/AccountController/AccountController";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import { DbCharacter } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let adminLevel: number = AccountsController.getAdminFromToken(req);

    if (adminLevel < 3) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

    if (!req.headers['x-search-character']) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

    let characterName: string = req.headers['x-search-character'].toString().replace(" ", "_");

    let findCharacter = await DatabaseController.selectQuery("SELECT * FROM characters WHERE character_name = ?", [
        characterName
    ]);

    res.send({ char: findCharacter });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);