import AccountsController from "@/lib/AccountController/AccountController";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { EndpointRequestTypes } from "@/utilClasses";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    let accountId: number = AccountsController.getIdFromToken(req);

    let adminPunishments = await DatabaseController.selectQuery("SELECT * from server_logs WHERE account_id = ?", [accountId]);

    res.status(200).send(
        adminPunishments
    );
}

export default middleware(handler, false, true, EndpointRequestTypes.get);