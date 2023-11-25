declare global {
	interface PlayerMp {
		browserRouter: string;
		browserInstance: BrowserMp;
		browserCurrentState: string;
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

export interface StreetData {
	getStreet: GetStreetNameAtCoordResult,
	zoneName: string,
	zoneTwo: string
}

export interface CharacterData {
	characterId: number,
	characterName: string
}

export interface Gui {
	playerId: number,
	direction: string,
	isFrozen: boolean,
	unix: number,
	zoneName: string,
	zoneNameTwo: string
}

export interface Flight {
	flying: boolean,
	f: number,
	w: number,
	h: number,
	l: number,
	point_distance: number
}
