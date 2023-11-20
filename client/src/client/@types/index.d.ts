declare global {
	interface PlayerMp {
		customProperty: number;
		browserInstance: BrowserMp;
	}
}

export interface UserData {
	accountId: number,
	adminDuty: boolean,
	adminLevel: number,
	adminName: string,
	playerId: number,
	username: string,
	isFlying: boolean
}
