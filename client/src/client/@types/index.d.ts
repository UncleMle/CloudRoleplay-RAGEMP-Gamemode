declare global {
	interface PlayerMp {
		customProperty: number;
		browserInstance: BrowserMp;
	}
}

export interface UserData {
	accountId: number,
	playerId: number,
	username: string,
	adminLevel: number,
	adminDuty: boolean,
	adminName: string,
}
