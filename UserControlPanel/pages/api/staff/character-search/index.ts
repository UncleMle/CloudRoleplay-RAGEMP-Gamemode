import AccountsController from "@/lib/AccountController/AccountController";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import { DbCharacter } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";

const selectProps: string[] = [
    "character_name", "UpdatedDate", "play_time_seconds",
    "injured_timer", "money_amount", "cash_amount",
    "character_faction_data", "character_isbanned", "character_id",
    "character_health"
]

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let adminLevel: number = AccountsController.getAdminFromToken(req);

    if (adminLevel < 3) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

    if (!req.headers['x-search-character']) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

    let characterName: string = req.headers['x-search-character'].toString().replace(" ", "_");

    let findCharacter: DbCharacter[] = await DatabaseController.selectQuery(`SELECT ${selectProps.join(", ")} FROM characters WHERE character_name = ?`, [
        characterName
    ]);

    if (findCharacter.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
            status: false,
            message: "Select character wasn't found"
        })
        return;
    }
    
    let getLogs = await DatabaseController.selectQuery("SELECT * FROM server_logs WHERE character_owner_id = ?", [
        findCharacter[0].character_id
    ]);

    findCharacter[0].charactersVehicles = await DatabaseController.selectQuery("SELECT vehicle_display_name, numberplate, CreatedDate FROM vehicles WHERE owner_id = ?", [
        findCharacter[0].character_id
    ]);

    res.send({ char: findCharacter[0], logs: getLogs });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);