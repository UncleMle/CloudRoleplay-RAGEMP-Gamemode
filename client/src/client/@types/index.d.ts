declare global {
	interface PlayerMp {
		browserRouter: string;
		inventoryStatus: boolean,
		fps: number;
		browserInstance: BrowserMp;
		browserCurrentState: string;
		isListening: boolean;
		__attachments: Attachment;
		__attachmentObjects: any;
		__attMgrData: any;
		_nickName: string;
		guiState: boolean;
		_fuelNozzleObject: ObjectMp | null;
		_mobilePhone: ObjectMp | null;
		lastReceivedPointing: number | undefined;
		pointingInterval: number | undefined;
	}

	interface PedMp {
		corpseId: number;
		corpseCharacterId: number;
	}
}

export interface UserData {
	account_id: number;
	adminDuty: boolean;
	admin_status: number;
	admin_name: string;
	username: string;
	isFlying: boolean;
	isFrozen: boolean;
	admin_esp: boolean;
	admin_ped: string;
	showAdminPed: boolean;
}

export interface SubtractVector {
	x: number;
	y: number;
	z: number;
}

export interface StreetData {
	getStreet: GetStreetNameAtCoordResult;
	zoneName: string;
	zoneTwo: string;
}

export interface Hunger {
	hunger: number;
	water: number;
}

export interface CharacterData {
	character_id: number;
	character_name: string;
	characterModel: CharacterModel;
	injured_timer: number,
	characterClothing: ClothingData;
}

export interface DbCharacter {
	character_id: number;
	owner_id: number;
	character_name: string;
	position_x: number;
	position_y: number;
	position_z: number;
	last_login: Date;
	character_health: number;
	character_isbanned: number;
	money_amount: number;
	play_time_seconds: bigint;
	player_dimension: number;
	player_exp: bigint;
	injured_timer: number;
	voiceChatState?: boolean;
	characterModel?: CharacterModel;
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
	player_tattos: Tatto[];
}

export interface Tatto {
	tattoo_id: number;
	tattoo_owner_id: number;
	tattoo_lib: string;
	tattoo_collection: string;
}

export interface TatFromUi {
	male: string;
	female: string;
}

export interface Gui {
	playerId: number;
	direction: string;
	isFrozen: boolean;
	unix: number;
	zoneName: string;
	zoneNameTwo: string;
	fps: number;
	voiceMuted: boolean;
}

export interface Flight {
	flying: boolean;
	f: number;
	w: number;
	h: number;
	l: number;
	point_distance: number;
}

export interface VehicleMods {
	vehicle_mod_id: number;
	vehicle_owner_id: number;
	spoilers: number;
	front_bumper: number;
	rear_bumper: number;
	side_skirt: number;
	exhaust: number;
	frame: number;
	grille: number;
	hood: number;
	fender: number;
	right_fender: number;
	roof: number;
	engine: number;
	brakes: number;
	transmission: number;
	horns: number;
	suspension: number;
	armor: number;
	turbo: number;
	xenon: number;
	front_wheels: number;
	wheel_type: number;
	back_wheels: number;
	plate_holders: number;
	trim_design: number;
	ornaments: number;
	dial_design: number;
	steering_wheel: number;
	shift_lever: number;
	plaques: number;
	hydraulics: number;
	boost: number;
	window_tint: number;
	pearleascent: number;
	wheel_colour: number;
	livery: number;
	plate: number;
	colour_1: number;
	colour_2: number;
	neon_colour_r: number;
	neon_colour_b: number;
	neon_colour_g: number;
}

export interface VehicleData {
	vehicle_id: number;
	owner_id: number;
	owner_name: string;
	engine_status: boolean;
	vehicle_name: string;
	vehicle_locked: boolean;
	vehicle_spawn_hash: number;
	numberplate: string;
	position_x: string;
	position_y: string;
	position_z: string;
	vehicle_doors: string[];
	vehicle_windows: string[];
	indicator_status: number;
	vehicle_siren: boolean;
	vehicle_fuel: number;
	vehicle_distance: number;
	vehicle_mods: VehicleMods;
	dirt_level: number;
	emergency_lights: boolean;
	vehicle_health: number;
}

export interface RenderKeys {
	space: boolean,
	tab: boolean
}

export interface VehicleWash {
	washPrice: number,
	vehicleWashName: string,
	position: Vector3
}

interface ModInfo {
	name: string;
	modNumber: number;
}

export interface BoneData {
	id: number;
	boneIndex: number;
	name: string;
	locked: boolean;
	bonePos: Vector3;
	raycast: RaycastResult;
	veh: VehicleMp;
	distance: number;
	pushTime: number;
}

export interface CreationCam {
	angle: number;
	dist: number;
	height: number;
}

export interface Minimap {
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	leftX: number;
	bottomY: number;
	rightX: number | null;
	topY: number | null;
}

export interface Attachment {
	id: number;
	model: number;
	offset: number;
	rotation: number;
	boneName: string;
}

export interface SpeedoData {
	vehicleSpeed: number;
	vehicleRpm: number;
	indicatorStatus: number;
	lockStatus: boolean;
	lightsStates: { lightsOn: boolean; highbeamsOn: boolean };
	fuelLevel: number;
	vehicleMileage: number;
	metric: number;
	numberPlate: string;
	displayName: string;
	dbName: string;
	vehHealth: number;
}

export interface Corpse {
	characterName: string;
	characterId: number;
	model: CharacterModel;
	clothes: ClothingData;
	corpseId: number;
	position: Vector3;
	unixCreated: number;
}

export interface ClothingStore {
	position: Vector3;
	name: string;
	id: number;
	displayName: string;
}

export interface ClothingData {
	clothing_id: number;
	character_id: number;
	mask: number;
	mask_texture: number;
	torso: number;
	torso_texture: number;
	leg: number;
	leg_texture: number;
	bags: number;
	bag_texture: number;
	shoes: number;
	shoes_texture: number;
	access: number;
	access_texture: number;
	undershirt: number;
	undershirt_texture: number;
	armor: number;
	armor_texture: number;
	decals: number;
	decals_texture: number;
	top: number;
	top_texture: number;
}

export interface ParkCol {
	name: string;
	owner_id: number;
	position: Vector3;
}

export interface RetrieveCol {
	name: string;
	owner_id: number;
	position: Vector3;
}

export interface DealerShip {
	dealerShipId: number;
	position: Vector3;
	spawnPosition: Vector3;
	viewPosition: Vector3;
	dealershipName: string;
	vehicles: DealerVehicle[];
	viewRange: number;
	vehDispNames: string[];
}

export interface DealerVehicle {
	spawnName: string;
	price: number;
}

export interface TattoShop {
	name: string;
	overlayDlc: string;
	position: Vector3;
}

export interface TattoData {
	name: string;
	data: object;
}

interface House {
	house_id: number;
	house_owner_id: number;
	house_name: string;
	house_position_x: number;
	house_position_y: number;
	house_position_z: number;
	house_interior_id: number;
	house_price: number;
	garage_size: number;
	blip_visible: boolean;
	interiorExitCol: ColshapeMp;
	isLocked: boolean;
	houseCol: ColshapeMp;
	houseLabel: TextLabelMp;
	priceLabel: TextLabelMp;
	houseMarker: TextLabelMp;
}

interface Interior {
	id: number;
	name: string;
	house: House;
	interiorPosition: Vector3;
	doorExitPosition: Vector3;
	doorExitCol: Vector3;
	interiorTextLabel: TextLabelMp;
	interiorMarker: MarkerMp;
}

interface RefuelStation {
	station_id: number,
	name: string,
	position: Vector3,
	pumps: RefuelPump[]
}

interface RefuelPump {
	position: Vector3,
	owner_id: number
}

interface InsuranceArea {
	insuranceId: number,
	insuranceName: string,
	spawnPosition: Vector3,
	retrievePosition: Vector3
}

interface Atm {
	Id: number;
	OwnerId: number;
	Position: Vector3;
	Name: string
}

interface Bank {
	name: string,
	blipPos: Vector3,
	tellers: Vector3[]
}