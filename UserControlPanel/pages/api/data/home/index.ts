import AccountsController from "@/lib/AccountController/AccountController";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { DbVehicle, Faction, IAccount } from "@/types";
import { EndpointRequestTypes } from "@/utilClasses";
import { DbCharacter } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    let accountId: number = AccountsController.getIdFromToken(req);
    let account: IAccount[] = await DatabaseController.selectQuery("SELECT * FROM accounts WHERE account_id = ? LIMIT 1", [accountId]);

    let adminPunishments = await DatabaseController.selectQuery("SELECT * FROM admin_punishments WHERE owner_account_id = ?", [accountId]);
    let characters: DbCharacter[] = await DatabaseController.selectQuery("SELECT * FROM characters WHERE owner_id = ?", [accountId]);

    for (const char of characters) {
        let query = "SELECT vehicle_display_name, "

        query += "numberplate, vehicle_dimension, vehicle_distance, "
        query += "vehicle_fuel, vehicle_health "
        query += "FROM vehicles WHERE owner_id = ?"

        char.charactersVehicles = await DatabaseController.selectQuery(query, [char.character_id]);
    }

    let factions: Faction[] = await DatabaseController.selectQuery("SELECT faction_name, owner_id FROM factions");

    for (let faction of factions) {
        let owner: DbCharacter[] = await DatabaseController.selectQuery("SELECT character_name FROM characters WHERE character_id = ?", [
            faction.owner_id
        ]);

        if (owner.length > 0) faction.owner_name = owner[0].character_name.replace("_", " ");
    }

    let staffMembers = await DatabaseController.selectQuery("SELECT admin_name, admin_status, ucp_image_url from accounts WHERE admin_status > 0");

    res.status(200).send({
        punishments: adminPunishments,
        characters: characters,
        factions: factions,
        staffMembers: staffMembers,
        accountData: {
            username: account[0].username,
            adminLevel: account[0].admin_status
        }
    });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);