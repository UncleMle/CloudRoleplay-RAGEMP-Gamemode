import { RowDataPacket } from "mysql2";

export class EndpointRequestTypes {
    public static get: string = "GET";
    public static post: string = "GET";
    public static put: string = "PUT";
    public static delete: string = "DELETE";
}

export interface IAccount extends RowDataPacket {
    account_id: number;
    account_uuid: string;
    username: string;
    redeem_code: string;
    password?: string;
    email_address?: string;
    user_ip?: string;
    auto_login_key?: string;
    auto_login: number;
    admin_status: number;
    vip_status: boolean;
    admin_name?: string;
    admin_ped?: string;
    client_serial?: string;
    ban_status: number;
    social_club_id: bigint;
    max_characters: number;
    admin_esp: boolean;
    has_first_login: boolean;
    vip_unix_expires: number;
    admin_jail_time: number;
    admin_jail_reason?: string;
    has_passed_quiz: boolean;
    quiz_fail_unix: number;
};