import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { Faction } from "@/types";
import { EndpointRequestTypes } from "@/utilClasses";
import { DbCharacter } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let factions: Faction[] = await DatabaseController.selectQuery("SELECT faction_name, owner_id FROM factions");

    for (let faction of factions) {
        let owner: DbCharacter[] = await DatabaseController.selectQuery("SELECT character_name FROM characters WHERE character_id = ?", [
            faction.owner_id
        ]);

        if (owner.length > 0) faction.owner_name = owner[0].character_name.replace("_", " ");
    }

    res.status(200).send({
        status: true,
        code: 200,
        factions: factions
    });
};

export default middleware(handler, false, true, EndpointRequestTypes.get);