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
	characterName: string,
	characterModel: CharacterModel
}

export interface CharacterModel {
	rotation: string;
	firstHeadShape: string;
	secondHeadShape: string;
	firstSkinTone: string;
	secondSkinTone: string;
	headMix: string;
	skinMix: string;
	sex: boolean;
	noseWidth: string;
	noseLength: string;
	noseTip: string;
	browHeight: string;
	cheekBoneHeight: string;
	cheeksWidth: string;
	lips: string;
	jawHeight: string;
	chinPosition: string;
	chinShape: string;
	noseHeight: string;
	noseBridge: string;
	noseBridgeShift: string;
	browWidth: string;
	cheekBoneWidth: string;
	eyes: string;
	jawWidth: string;
	chinLength: string;
	chinWidth: string;
	neckWidth: string;
	eyeColour: string;
	blemishes: string;
	ageing: string;
	facialHairStyle: string;
	facialHairColour: string;
	chestHairStyle: string;
	hairStyle: string;
	hairColour: string;
	hairHighlights: string;
	eyebrowsStyle: string;
	eyebrowsColour: string;
	complexion: string;
	sunDamage: string;
	molesFreckles: string;
	blushStyle: string;
	makeup: string;
	lipstick: string;
	blushColour: string;
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
	engine_status: boolean,
	vehicle_name: string,
	vehicle_locked: boolean,
	vehicle_spawn_hash: number,
	numberplate: string,
	position_x: string,
	position_y: string,
	position_z: string,
	vehicle_doors: string[],
	vehicle_windows: string[],
	indicator_status: number,
	vehicle_siren: boolean
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

export interface CreationCam {
	angle: number,
	dist: number,
	height: number
}
