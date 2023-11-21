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
	isFlying: boolean,
	isFrozen: boolean
}

export interface CharacterData {
	characterId: number,
	characterName: string
}

export interface Flight {
	flying: boolean,
	f: number,
	w: number,
	h: number,
	l: number,
	point_distance: number
}
