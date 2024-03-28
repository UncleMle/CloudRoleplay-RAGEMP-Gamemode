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

    if (!req.headers['x-ban-time'] || !req.headers['x-ban-accid'] || !req.headers['x-ban-accid']) {
        apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);
        return;
    }

    let currentUnix: number = Math.floor(Date.now() / 1000);
    let liftUnix: number = currentUnix + (Number(req.headers['x-ban-time']) * 60);
    let reason: string = req.headers['x-ban-reason'] as string;
    let accountId: number = Number(req.headers['x-ban-accid']);
    let adminName: string = tokenData.adminName;


    let props: string[] = userPropertiesDb;

    props.push("email_address");
    props.push("user_ip");
    props.push("client_serial");
    props.push("has_passed_quiz");
    props.push("social_club_name");
    props.push("social_club_id");

    let accounts: User[] = await DatabaseController.selectQuery(`SELECT ${props.join(",")} FROM accounts WHERE account_id = ? LIMIT 1`, [
        accountId
    ]);

    if (accounts.length === 0) {
        apiErrorHandle(res, HttpStatusCodes.NOT_FOUND);
        return;
    }

    let banQuery = "INSERT INTO bans SET ";
    banQuery += "CreatedDate = ?, UpdatedDate = ?, ip_address = ?, client_serial = ?, ";
    banQuery += "social_club_id = ?, social_club_name = ?, username = ?, account_id = ?, ";
    banQuery += "ban_reason = ?, admin = ?, lift_unix_time = ?, issue_unix_date = ?";

    let account: User = accounts[0];

    await DatabaseController.insertQuery(banQuery, [
        new Date(), new Date(), account.user_ip, account.client_serial,
        account.social_club_id, account.social_club_name, account.username, account.account_id,
        reason, adminName, liftUnix, currentUnix
    ]);

    await DatabaseController.deleteQuery("UPDATE bans SET is_active = 0 WHERE account_id = ?", [
        account.account_id
    ]);

    let punishmentQuery = "INSERT INTO admin_punishments SET "
    punishmentQuery += "CreatedDate = ?, UpdatedDate = ?, owner_account_id = ?, punishment_type = ?, ";
    punishmentQuery += "admin_name = ?, punishment_reason = ?, is_void = ?, unix_expires = ?";

    await DatabaseController.insertQuery(punishmentQuery, [
        new Date(), new Date(), account.account_id, PunishmentType.AdminBan,
        adminName, reason, 0, liftUnix
    ]);

    await DatabaseController.updateQuery("UPDATE accounts SET ban_status = 1 WHERE account_id = ? LIMIT 1", [
        account.account_id
    ]);

    await AccountsController.postToBanHook(`${adminName} banned ${accounts[0].username} with reason ` + "``" + reason.replaceAll("`", "") + "``" + ` expires: ${liftUnix === -1 ? "**permanent**" : `<t:${liftUnix}>`}`);

    res.status(200).send({
        status: true,
        message: `Banned account ${accounts[0].username} with reason ${reason} lift unix time ${liftUnix} `
    });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);