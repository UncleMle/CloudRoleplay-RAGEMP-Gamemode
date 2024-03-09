import { AccountSessionOtpData, IAccount } from "@/types";
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

    public static tokenAuthentication(token: string | void | null | string[]): boolean {
        try {
            let decoded = jwt.verify(token as string, "jwtPrivateKey");

            decoded = decoded as {
                x: number
            };

            return decoded.id != -1 ? true : false;
        } catch (e) {
            return false;
        }
    }
    
    public static otpVerification(token: string | void | null | string[]): AccountSessionOtpData | null {
        console.log(token);
        try {
            let decoded = jwt.verify(token as string, "jwtPrivateKey");

            decoded = decoded as AccountSessionOtpData;

            console.log("decoded" + decoded);

            return decoded.accountOtpSession;
        } catch (e) {
            return null;
        }
    }

    public static getIdFromToken(req: NextApiRequest): number {
        let accountId: number = -1;
        let decoded = jwt.verify(req.headers['x-auth-token'] as string, "jwtPrivateKey");

        if (decoded) {
            decoded = decoded as {
                x: number
            };

            accountId = decoded.id;
        }

        return accountId;
    }

    public static generateOtp(length: number = 5): string {
        let otp: string = "";
        let numbers: string = "1234567890";

        for (let i = 0; i < length; i++) {
            otp += numbers[Math.floor(Math.random() * numbers.length)];
        }

        return otp;
    }
}