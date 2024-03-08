import { IAccount } from "@/types";
import pool from "../mysqlDb";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";

export default class AccountsController {
    public static checkAccountPassword(targetHash: string, compare: string): boolean {
        let match: boolean = true;

        const hashBytes: Buffer = Buffer.from(targetHash, 'base64');
        const salt: Buffer = hashBytes.slice(0, 16);
        const pbkdf2: Buffer = crypto.pbkdf2Sync(compare, salt, 100000, 20, 'sha1');
        const hash: Buffer = pbkdf2;

        for (let i = 0; i < 20; i++) {
            if (hashBytes[i + 16] !== hash[i]) {
                match = false;
                break;
            }
        }

        return match;
    }

    public static async tokenAuthentication(token: string | void | null | string[]): Promise<boolean> {
        try {
            const decoded = jwt.verify(token as string, "jwtPrivateKey");
            return decoded ? true : false;


        } catch (e) {
            return false;
        }
    }

    public static getIdFromToken(req: NextApiRequest): number {
        let accountId: number = -1;
        let decoded = jwt.verify(req.headers['x-auth-token'] as string, "jwtPrivateKey");

        if(decoded) {
            decoded = decoded as {
                x: number
            };

            accountId = decoded.id;
        }

        return accountId;
    }
}