import { RowDataPacket } from "mysql2";

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

export interface ServerInfo {
    name: string;
    gamemode: string;
    url: string;
    lang: string;
    players: number;
    peak: number;
    maxplayers: number;
}

export interface ServerList {
    [serverAddress: string]: ServerInfo;
}

export type AccountSessionOtpData = {
    accountId: number,
    username: string
}

export interface ServerDashboardData {
    accountData: {
        username: string, adminLevel: number
    }
    characters: DbCharacter[],
    punishments: AdminPunishment[],
    factions: Faction[],
    staffMembers: {
        admin_name: string,
        admin_status: number,
        ucp_image_url: string
    }[];
}

export interface AdminPunishment {
    admin_punishment_id: number;
    owner_account_id: number;
    punishment_type: number;
    admin_name: string;
    punishment_reason: string;
    is_void: number;
    unix_expires: number;
}

export interface DbCharacter {
    character_id: number;
    owner_id: number;
    character_name: string;
    position_x: number;
    position_y: number;
    position_z: number;
    last_login: string;
    character_health: number;
    character_water: number;
    character_hunger: number;
    character_isbanned: number;
    money_amount: number;
    cash_amount: number;
    salary_amount?: number;
    play_time_seconds: number;
    player_dimension: number;
    player_exp: number;
    injured_timer: number;
    freelance_job_data: string;
    character_license_data: string;
    character_faction_data: string;
    faction_duty_status: number;
    faction_ranks: string;
    faction_duty_uniform: number;
    freelance_job_uniform: number;
    last_spun_luckywheel: number;
    charactersVehicles: DbVehicle[];
}

export interface DbVehicle {
    vehicle_id: number;
    vehicle_uuid: string;
    owner_id: number;
    owner_name: string;
    vehicle_name: string;
    vehicle_display_name: string;
    vehicle_class_id: number;
    vehicle_locked: boolean;
    vehicle_spawn_hash: number;
    numberplate: string;
    position_x: number;
    position_y: number;
    position_z: number;
    rotation_x: number;
    rotation_y: number;
    rotation_z: number;
    rotation: number;
    vehicle_dimension: string;
    vehicle_insurance_id: number;
    vehicle_parking_lot_id: number;
    vehicle_fuel: number;
    vehicle_distance: number;
    vehicle_health: number;
    dealership_id: number;
    dealership_price: number;
    dealership_spot_id: number;
    dealership_description: string;
    faction_owner_id: number;
    insurance_status: boolean;
    vehicle_garage_id: number;
    tyre_states: string;
}

export interface Faction {
    faction_id: number;
    faction_name: string;
    owner_id: number;
    owner_name: string;
    faction_allowed_vehicles: string;
}

export type ServerLog = {
    server_log_id: number;
    CreatedDate: string;
    UpdatedDate: string;
    server_log_name: string;
    server_log_description: string;
    character_owner_id: number;
    log_type: number;
    account_id: number;
};