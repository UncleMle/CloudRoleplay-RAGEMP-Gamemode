import AccountsController from "@/lib/AccountController/AccountController";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { IAccount } from "@/types";
import { EndpointRequestTypes } from "@/utilClasses";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    let accountId: number = AccountsController.getIdFromToken(req);

    let adminPunishments = await DatabaseController.selectQuery("SELECT * FROM server_logs WHERE account_id = ?", [accountId]);
    let characters = await DatabaseController.selectQuery("SELECT * FROM characters WHERE owner_id = ?", [accountId]);
    let account: IAccount[] = await DatabaseController.selectQuery("SELECT * FROM accounts WHERE account_id = ? LIMIT 1", [accountId]);

    res.status(200).send({
        punishments: adminPunishments,
        characters: characters,
        accountData: {
            username: account[0].username,
            adminLevel: account[0].admin_status
        }
    });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);