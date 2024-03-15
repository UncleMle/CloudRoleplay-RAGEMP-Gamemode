import AccountsController, { TokenData } from "@/lib/AccountController/AccountController";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { PunishmentType, PunishmentTypes, selectCharProps, userPropertiesDb } from "@/sharedConstants";
import { AdminPunishment, DbCharacter, ServerLog, User } from "@/types";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let tokenData: TokenData | null = AccountsController.getDataFromToken(req);

    if (!tokenData || tokenData && tokenData.adminLevel < 3) {
        apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);
        return;
    }

    if (!req.headers['x-ajail-time'] || !req.headers['x-ajail-accid'] || !req.headers['x-ajail-accid']) {
        apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);
        return;
    }

    let currentUnix: number = Math.floor(Date.now() / 1000);
    let minutes = Number(req.headers['x-ajail-time']);
    let liftUnix: number = currentUnix + minutes * 60;
    let reason: string = req.headers['x-ajail-reason'] as string;
    let accountId: number = Number(req.headers['x-ajail-accid']);
    let adminName: string = tokenData.adminName;

    let accounts: User[] = await DatabaseController.selectQuery(`SELECT username, account_id FROM accounts WHERE account_id = ? LIMIT 1`, [
        accountId
    ]);

    if (accounts.length === 0) {
        apiErrorHandle(res, HttpStatusCodes.NOT_FOUND);
        return;
    }

    let account: User = accounts[0];

    let punishmentQuery = "INSERT INTO admin_punishments SET "
    punishmentQuery += "CreatedDate = ?, UpdatedDate = ?, owner_account_id = ?, punishment_type = ?, ";
    punishmentQuery += "admin_name = ?, punishment_reason = ?, is_void = ?, unix_expires = ?";

    await DatabaseController.insertQuery(punishmentQuery, [
        new Date(), new Date(), account.account_id, PunishmentType.AdminJail,
        adminName, reason, 0, liftUnix
    ]);

    await DatabaseController.updateQuery("UPDATE accounts SET admin_jail_time = ?, admin_jail_reason = ? WHERE account_id = ? LIMIT 1", [
        minutes * 60, reason, account.account_id
    ]);

    res.status(200).send({
        status: true,
        message: `Admin jailed account ${accounts[0].username} with reason ${reason} lift unix time ${liftUnix} `
    });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);