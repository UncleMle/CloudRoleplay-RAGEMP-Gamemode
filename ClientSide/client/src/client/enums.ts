export enum BrowserEnv {
	development = "192.168.1.108:3000/?#/", //"package://dist/index.html",
	production = "192.168.1.108:3000/?#/"
}

export enum AdminRanks {
	admin_None = 0,
	admin_Support = 1,
	Admin_SeniorSupport = 2,
	Admin_Moderator = 3,
	Admin_SeniorModerator = 4,
	Admin_Admin = 5,
	Admin_SeniorAdmin = 6,
	Admin_HeadAdmin = 7,
	Admin_Founder = 8
}

export class MutationKeys {
	public static readonly PlayerStats: string = "player_stats";
	public static readonly PlayerData: string = "player_data_server";
	public static readonly PlayerGui: string = "player_data_gui";
	public static readonly ModIndexes: string = "vehicle_mod_indexes";
}

export class Browsers {
	public static readonly Login: string = "/login";
	public static readonly Stats: string = "/stats";
	public static readonly Ban: string = "/ban";
	public static readonly CharCreation: string = "/charcreation";
	public static readonly Reports: string = "/reports";
	public static readonly Clothing: string = "/clothing";
	public static readonly Parking: string = "/parking";
	public static readonly ModsView: string = "/vehiclemods";
	public static readonly Dealership: string = "/dealerships";
	public static readonly Tattoos: string = "/tattoos";
	public static readonly Insurance: string = "/insurance";
	public static readonly Atm: string = "/atm";
}