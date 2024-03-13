import AccountsController, { TokenData } from "@/lib/AccountController/AccountController";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { selectCharProps, userPropertiesDb } from "@/sharedConstants";
import { AdminPunishment, DbCharacter, ServerLog, User } from "@/types";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let tokenData: TokenData | null = AccountsController.getDataFromToken(req);

    if (!tokenData || tokenData && tokenData.adminLevel < 7) return;

    let props: string[] = userPropertiesDb;

    if (!req.headers['x-search-account']) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

    let idOrUsername: string = req.headers['x-search-account'].toString();

    props.push("email_address");
    props.push("user_ip");
    props.push("has_passed_quiz");
    props.push("social_club_name");

    let findAccount: User[] = await DatabaseController.selectQuery(`SELECT ${props.join(",")} FROM accounts WHERE username = ? OR account_id = ?`, [
        idOrUsername, idOrUsername
    ]);

    if (findAccount.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
            status: false,
            error: "Account wasn't found"
        });
        return;
    }

    let getAdminLogs: ServerLog[] = await DatabaseController.selectQuery("SELECT * FROM server_logs WHERE account_id = ?", [
        findAccount[0].account_id
    ]);

    let punishments: AdminPunishment[] = await DatabaseController.selectQuery("SELECT * FROM admin_punishments WHERE owner_account_id = ?", [
        findAccount[0].account_id
    ]);

    let characters: DbCharacter[] = await DatabaseController.selectQuery(`SELECT ${selectCharProps.join(",")} FROM characters WHERE owner_id = ?`, [
        findAccount[0].account_id
    ]);

    res.status(200).send({
        account: findAccount[0], adminLogs: getAdminLogs, punishments: punishments, characters: characters
    });
}

export default middleware(handler, false, true, EndpointRequestTypes.get);