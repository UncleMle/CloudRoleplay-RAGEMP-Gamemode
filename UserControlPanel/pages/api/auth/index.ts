import { NextApiRequest, NextApiResponse } from "next";
import crypto from 'crypto';
import pool from "../../../lib/mysqlDb";
import { EndpointRequestTypes, IAccount } from "@/types";
import DatabaseController from "@/lib/mysqlDbController";
import middleware from "@/lib/Middleware/Middleware";

const handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> = async (req: NextApiRequest, res: NextApiResponse) => {

  let account: IAccount[] = await DatabaseController.selectQuery<IAccount[]>("SELECT * FROM accounts where username = ? LIMIT 1", ["unclemole"]);

  if (account.length === 0) return;

  
}

export default middleware(handler, false, false, EndpointRequestTypes.get);


