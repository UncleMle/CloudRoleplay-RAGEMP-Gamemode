import { IAccount } from "@/types";
import pool from "../mysqlDb";
import crypto from 'crypto';

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
}