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

export interface VehicleData {
	vehicle_id: number,
	owner_id: number,
	vehicle_name: string,
	vehicle_locked: boolean,
	vehicle_spawn_hash: number,
	numberplate: string,
	position_x: string,
	position_y: string,
	position_z: string,
	vehicle_doors: string[],
	vehicle_windows: string[]
}

export interface BoneData {
	id: number,
	boneIndex: number,
	name: string,
	locked: boolean,
	bonePos: Vector3,
	raycast: RaycastResult,
	veh: VehicleMp,
	distance: number,
	pushTime: number
}

