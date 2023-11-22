export enum BrowserEnv {
	development = "localhost:3000/?#/", //"package://dist/index.html",
	production = "http://localhost:8080/"
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
