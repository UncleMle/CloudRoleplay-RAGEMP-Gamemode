export const adminRanksList: string[] = ["None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "Developer"];
export const adminRanksColours: string[] = ["", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff", "#c096ff"];
export const factions: string[] = [
    "None",
    "LSPD",
    "SASD",
    "LSMD",
    "Weazel_News",
    "Bayview",
    "LS_Customs",
    "DCC"
];

export const factionColours: string[] = [
    "", // Factions.None
    "#5998ff", // Factions.LSPD
    "#7bb089", // Factions.SASD
    "#f25130", // Factions.LSMD
    "#baffe6", // Factions.Weazel_News
    "#878787", // Factions.Bayview
    "#878787", // Factions.LS_Customs
    "#f0cb58" // Factions.DCC
]

export const logTypes: string[] = [
    "Cash / Money",
    "Asset Purchase",
    "Admin Log"
]

export const PunishmentTypes: string[] = [
    "Jail",
    "Ban",
    "Warn",
    "Kick",
    "Back To Quiz"
]

export enum PunishmentType {
    AdminJail,
    AdminBan,
    AdminWarn,
    AdminKick,
    AdminSetBackToQuiz
}

export const userPropertiesDb: string[] = [
    "account_id",
    "username",
    "admin_status",
    "admin_name",
    "vip_status",
    "CreatedDate"
];

export const selectCharProps: string[] = [
    "character_name", "UpdatedDate", "play_time_seconds",
    "injured_timer", "money_amount", "cash_amount",
    "character_faction_data", "character_isbanned", "character_id",
    "character_health", "owner_id"
]