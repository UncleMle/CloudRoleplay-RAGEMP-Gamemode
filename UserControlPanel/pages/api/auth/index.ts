import { NextApiRequest, NextApiResponse } from "next";
import crypto from 'crypto';
import pool from "../../../lib/mysqlDb";
import { AccountSessionOtpData, IAccount } from "@/types";
import DatabaseController from "@/lib/mysqlDbController";
import middleware from "@/lib/Middleware/Middleware";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import AccountsController from "@/lib/AccountController/AccountController";
import { serialize } from "cookie";
import jwt from 'jsonwebtoken';
import requestIp from 'request-ip'

interface AuthEndpointBody {
  username: string,
  password: string
}

const handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> = async (req: NextApiRequest, res: NextApiResponse) => {
  if (AccountsController.tokenAuthentication(req.headers['x-auth-token'])) return;

  if (!req.body || !req.body.payload) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

  let body: AuthEndpointBody = req.body.payload;

  if (!body.password || !body.username) return apiErrorHandle(res, HttpStatusCodes.BAD_REQUEST);

  let accounts: IAccount[] = await DatabaseController.selectQuery<IAccount[]>("SELECT * FROM accounts where username = ? LIMIT 1", [
    body.username
  ]);

  if (accounts.length === 0 || !accounts) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

  if (!AccountsController.checkAccountPassword(accounts[0].password as string, body.password)) return apiErrorHandle(res, HttpStatusCodes.UNAUTHORIZED);

  let account: IAccount = accounts[0];
  let targetIp: string | null = requestIp.getClientIp(req);

  if (account.user_ip !== targetIp) {
  }

  const token = jwt.sign(
    { id: account.account_id },
    "jwtPrivateKey",
    {
      expiresIn: "5h",
    }
  );

  res.setHeader("Set-Cookie", serialize("user-jwt-token", token, { path: "/" }));

  res.status(200).send({
    status: true,
    code: 200
  });
}

export default middleware(handler, false, false, EndpointRequestTypes.post);


