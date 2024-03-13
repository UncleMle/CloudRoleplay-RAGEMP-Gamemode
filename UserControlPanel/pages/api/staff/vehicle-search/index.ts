import AccountsController from "@/lib/AccountController/AccountController";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import { DbCharacter, DbVehicle, User } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { selectCharProps, userPropertiesDb } from "@/sharedConstants";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let adminLevel: number | undefined = AccountsController.getDataFromToken(req)?.adminLevel;
    let props: string[] = userPropertiesDb;

    if (adminLevel && adminLevel < 3) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

    if (!req.headers['x-search-vehicle']) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

    let plateOrId: string = req.headers['x-search-vehicle'].toString().toUpperCase().replace(" ", "_");

    let findVehicle: DbVehicle[] = await DatabaseController.selectQuery(`SELECT * FROM vehicles WHERE vehicle_id = ? OR numberplate = ? LIMIT 1`, [
        plateOrId, plateOrId
    ]);

    if (findVehicle.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
            status: false,
            message: "Select character wasn't found"
        })
        return;
    }

    if (adminLevel && adminLevel >= 7) props.push("email_address");

    let character: DbCharacter[] = await DatabaseController.selectQuery(`SELECT character_name, character_id, owner_id FROM characters WHERE character_id = ?`, [
        findVehicle[0].owner_id
    ]);

    let account: User[] = [];

    if (character.length > 0) {
        account = await DatabaseController.selectQuery(`SELECT ${props.join(",")} FROM accounts WHERE account_id = ? LIMIT 1`, [
            character[0].owner_id
        ]);
    }

    res.send({ veh: findVehicle[0], acc: account[0], char: character[0] });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);