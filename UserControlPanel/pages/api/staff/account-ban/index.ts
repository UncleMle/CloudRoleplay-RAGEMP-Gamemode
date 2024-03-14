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

    if (!req.headers['x-ban-time'] || !req.headers['x-ban-accid']) return;

    let time: string = req.headers['x-ban-time'] as string;
    let reason: string = req.headers['x-ban-reason'] as string;

    let props: string[] = userPropertiesDb;

    props.push("email_address");
    props.push("user_ip");
    props.push("has_passed_quiz");
    props.push("social_club_name");

    console.log(req.headers);

}

export default middleware(handler, false, true, EndpointRequestTypes.get);