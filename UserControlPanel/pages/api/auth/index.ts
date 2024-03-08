import { NextApiRequest, NextApiResponse } from "next";
import crypto from 'crypto';
import pool from "../../../lib/mysqlDb";
import { IAccount } from "@/types";
import DatabaseController from "@/lib/mysqlDbController";
import middleware from "@/lib/Middleware/Middleware";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import AccountsController from "@/lib/AccountController/AccountController";
import { serialize } from "cookie";
import jwt from 'jsonwebtoken';

interface AuthEndpointBody {
  username: string,
  password: string
}

const handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> = async (req: NextApiRequest, res: NextApiResponse) => {

  if (!req.body || !req.body.payload) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

  let body: AuthEndpointBody = req.body.payload;

  if (!body.password || !body.username) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

  let account: IAccount[] = await DatabaseController.selectQuery<IAccount[]>("SELECT * FROM accounts where username = ? LIMIT 1", [
    body.username
  ]);

  if (account.length === 0 || !account) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

  if (!AccountsController.checkAccountPassword(account[0].password as string, body.password)) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

  let accountId: number = account[0].account_id;

  const token = jwt.sign(
    { id: accountId },
    "jwtPrivateKey",
    {
      expiresIn: "5h",
    }
  );

  res.setHeader("Set-Cookie", serialize("user-jwt-token", token, { path: "/" }));

  res.status(200).send({
    status: true,
    code: 200,
    authedAccount: account
  });
}

export default middleware(handler, false, false, EndpointRequestTypes.post);


