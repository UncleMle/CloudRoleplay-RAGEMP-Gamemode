'use strict';

var BrowserEnv;
(function (BrowserEnv) {
    BrowserEnv["development"] = "192.168.1.108:3000/?#/";
    BrowserEnv["production"] = "192.168.1.108:3000/?#/";
})(BrowserEnv || (BrowserEnv = {}));
var AdminRanks;
(function (AdminRanks) {
    AdminRanks[AdminRanks["admin_None"] = 0] = "admin_None";
    AdminRanks[AdminRanks["admin_Support"] = 1] = "admin_Support";
    AdminRanks[AdminRanks["Admin_SeniorSupport"] = 2] = "Admin_SeniorSupport";
    AdminRanks[AdminRanks["Admin_Moderator"] = 3] = "Admin_Moderator";
    AdminRanks[AdminRanks["Admin_SeniorModerator"] = 4] = "Admin_SeniorModerator";
    AdminRanks[AdminRanks["Admin_Admin"] = 5] = "Admin_Admin";
    AdminRanks[AdminRanks["Admin_SeniorAdmin"] = 6] = "Admin_SeniorAdmin";
    AdminRanks[AdminRanks["Admin_HeadAdmin"] = 7] = "Admin_HeadAdmin";
    AdminRanks[AdminRanks["Admin_Founder"] = 8] = "Admin_Founder";
})(AdminRanks || (AdminRanks = {}));
class Browsers {
    static Login = "/login";
    static Stats = "/stats";
    static Ban = "/ban";
    static CharCreation = "/charcreation";
    static Reports = "/reports";
    static Clothing = "/clothing";
    static Parking = "/parking";
    static ModsView = "/vehiclemods";
    static Dealership = "/dealerships";
    static Tattoos = "/tattoos";
    static Insurance = "/insurance";
    static Atm = "/atm";
}

const _REMOVE_TIMER_NATIVE = "0xF4F2C0D4EE209E20";
const _SWITCH_OUT_PLAYER_NATIVE = "0xAAB3200ED59016BC";
const _SWITCH_IN_PLAYER_NATIVE = "0xD8295AF639FD9CB8";
const _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE = "0xD9D2CFFF49FAB35F";
const _sharedAccountDataIdentifier = "PlayerAccountData";
const _sharedCharacterDataIdentifier = "PlayerCharacterData";
const _sharedCharacterModelIdentifier = "characterModel";
const _sharedHungerDataIdentifier = "characterWaterAndHunger";
const _sharedClothingDataIdentifier = "characterClothing";
const _TEXT_CLOUD_ADMINBLUE = "#75a8ff";
const _SET_FORCE_PED_FOOTSTEPS_TRACKS = "0xAEEDAD1420C65CC0";
const SET_PARTICLE_FX_ = "0xBA3D194057C79A7B";
const TASK_WARP_PED_INTO_VEHICLE = "0x9A7D091411C5F684";
const _SHARED_VEHICLE_DATA = "VehicleData";
const _SHARED_VEHICLE_MODS_DATA = "VehicleModData";
const IS_RADAR_HIDDEN = "0x157F93B036700462";
const IS_RADAR_ENABLED = "0xAF754F20EB5CD51A";
const CF_PED_FLAG_CAN_FLY_THRU_WINDSCREEN = 32;
const CLEAR_FOCUS = "0x31B73D1EA9F01DA2";
const COLOURED_HEADLIGHT_NATIVE = "0xE41033B25D003A07";
const _control_ids = {
    F5: 327,
    W: 32,
    K: 75,
    S: 33,
    G: 71,
    F: 70,
    A: 34,
    Y: 89,
    E: 38,
    J: 74,
    X: 88,
    I: 73,
    LEFTARR: 37,
    RIGHTARR: 39,
    EBIND: 69,
    QBIND: 81,
    BBIND: 0x42,
    Q: 44,
    D: 35,
    Space: 321,
    SPACEBIND: 32,
    TAB: 9,
    LCtrl: 326,
    RELOADBIND: 0x52,
    NBIND: 78,
    F4: 115,
    F9: 120,
    F10: 121
};
const _config_flags = {
    PED_FLAG_STOP_ENGINE_TURNING: 429
};

const getTargetData = (target) => {
    let sharedData = target.getVariable(_sharedAccountDataIdentifier);
    if (!sharedData)
        return;
    return sharedData;
};

const getUserData = () => {
    let sharedData = mp.players.local.getVariable(_sharedAccountDataIdentifier);
    if (!sharedData)
        return;
    return sharedData;
};

const F2 = 0x71;

let isFunctionPressed;
class BrowserSystem {
    _browserBaseUrl = BrowserEnv.development;
    static _browserInstance;
    static IdleDate = new Date();
    static LocalPlayer;
    constructor() {
        BrowserSystem._browserInstance = mp.browsers.new(this._browserBaseUrl);
        BrowserSystem.LocalPlayer = mp.players.local;
        BrowserSystem.LocalPlayer.browserInstance = BrowserSystem._browserInstance;
        BrowserSystem.LocalPlayer.browserRouter = '/';
        mp.events.add('guiReady', BrowserSystem.onGuiReady);
        mp.events.add('render', BrowserSystem.handleRender);
        mp.events.add('client:recieveUiMutation', BrowserSystem.handleMutationChange);
        mp.events.add('browser:sendObject', BrowserSystem.handleBrowserObject);
        mp.events.add('browser:sendString', BrowserSystem.handleBrowserString);
        mp.events.add('browser:pushRouter', BrowserSystem.pushRouter);
        mp.events.add('browser:handlePlayerObjectMutation', BrowserSystem.handleObjectToBrowser);
        mp.events.add('browser:handlePlayerObjectMutationPush', BrowserSystem.handleObjectToBrowserPush);
        mp.events.add('browser:resetRouter', BrowserSystem.handleReset);
        mp.events.add('browser:resetMutationPusher', BrowserSystem.resetMutationPusher);
        mp.events.add('browser:sendErrorPushNotif', BrowserSystem.sendErrorPushNotif);
        mp.events.add('browser:sendNotif', BrowserSystem.sendNotif);
        mp.events.add('browser:setAuthState', BrowserSystem.setAuthState);
        mp.events.add('browser:clearChat', BrowserSystem.clearChat);
        mp.keys.bind(F2, false, function () {
            isFunctionPressed = !isFunctionPressed;
            if (isFunctionPressed && !mp.game.ui.isPauseMenuActive()) {
                mp.gui.cursor.show(true, true);
            }
            else {
                mp.gui.cursor.show(false, false);
            }
        });
    }
    static clearChat() {
        BrowserSystem._browserInstance?.execute("gui.chat.clearChat();");
    }
    static onGuiReady() {
        mp.gui.chat.show(false);
        BrowserSystem._browserInstance?.markAsChat();
    }
    static setAuthState(state) {
        if (BrowserSystem._browserInstance) {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
				_stateKey: "authenticationState",
				status: "${state}"
			})`);
        }
    }
    static handleRender() {
        BrowserSystem.disableAfkTimer();
        BrowserSystem.disableDefaultGuiElements();
    }
    static pushRouter(route, showCursor = true) {
        if (BrowserSystem._browserInstance) {
            if (showCursor) {
                mp.gui.cursor.show(true, true);
            }
            BrowserSystem.LocalPlayer.browserRouter = route;
            BrowserSystem._browserInstance.execute(`router.push("${route}")`);
        }
    }
    static handleMutationChange(mutationName, key, value) {
        if (BrowserSystem._browserInstance) {
            BrowserSystem._browserInstance.execute(`appSys.commit("${mutationName}", {
						${key}: ${value}
			})`);
        }
    }
    static handleReset() {
        BrowserSystem.pushRouter('/');
        mp.gui.cursor.show(false, false);
    }
    static handleObjectToBrowser(_mutationKey, data) {
        if (!BrowserSystem._browserInstance)
            return;
        BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
			_mutationKey: "${_mutationKey}",
			data: ${JSON.stringify(data)}
		})`);
    }
    static handleObjectToBrowserPush(_mutationKey, data) {
        if (!BrowserSystem._browserInstance)
            return;
        BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationPusher", {
			_mutationKey: "${_mutationKey}",
			data: ${JSON.stringify(data)}
		})`);
    }
    static resetMutationPusher = (_mutationKey) => {
        if (!BrowserSystem._browserInstance)
            return;
        BrowserSystem._browserInstance.execute(`appSys.commit('setLoadingState', {
			toggle: false
		})`);
        BrowserSystem._browserInstance.execute(`appSys.commit("resetPlayerMutationPusher", {
			_mutationKey: "${_mutationKey}",
		})`);
    };
    static sendErrorPushNotif(message, time) {
        BrowserSystem._browserInstance.execute(`gui.notify.sendError("${message}", ${time});`);
    }
    static sendNotif(message, progbar, dragbl, time) {
        BrowserSystem._browserInstance.execute(`gui.notify.showNotification("${message}", ${progbar}, ${dragbl}, ${time});`);
    }
    static handleBrowserObject(eventName, _object) {
        mp.events.callRemote(eventName, _object);
    }
    static handleBrowserString(eventName, _string) {
        mp.events.callRemote(eventName, _string);
    }
    static disableAfkTimer() {
        const dif = new Date().getTime() - BrowserSystem.IdleDate.getTime();
        const seconds = dif / 1000;
        if (Math.abs(seconds) > 29.5) {
            mp.game.invoke(_REMOVE_TIMER_NATIVE);
            BrowserSystem.IdleDate = new Date();
        }
    }
    static disableDefaultGuiElements() {
        mp.game.ui.hideHudComponentThisFrame(8); // Vehicle class
        mp.game.ui.hideHudComponentThisFrame(6); // Vehicle Name
        mp.game.ui.hideHudComponentThisFrame(7); // area name
        mp.game.ui.hideHudComponentThisFrame(9); // street name
        mp.game.ui.hideHudComponentThisFrame(3); // cash
        mp.game.graphics.disableVehicleDistantlights(true);
        mp.game.ui.setRadarZoom(1100);
        mp.game.player.setHealthRechargeMultiplier(0.0);
    }
}

class NotificationSystem {
    static x_pos = 0.5;
    static y_pos = 0.5;
    static ameDuration_seconds = 6;
    static opacity = 255;
    static scale = 0.55;
    static draw_text;
    static visible;
    static interval;
    static ameCancelTimeout;
    static _ameServerEvent = "server:createAmeText";
    static _ameTextIdentifier = "playerAmeTextMessage";
    static isRpText;
    constructor() {
        mp.events.add("render", NotificationSystem.handleRender);
        mp.events.add("client:addNotif", NotificationSystem.createNotification);
    }
    static createNotification(text, isRpText = true, isAme = false, ameText = "") {
        clearInterval(NotificationSystem.interval);
        NotificationSystem.resetData();
        NotificationSystem.visible = true;
        NotificationSystem.draw_text = isRpText ? "* " + text : text;
        NotificationSystem.isRpText = isRpText;
        NotificationSystem.interval = setInterval(() => {
            if (NotificationSystem.opacity < 1) {
                clearInterval(NotificationSystem.interval);
                NotificationSystem.resetData();
                return;
            }
            NotificationSystem.opacity -= 0.7;
            NotificationSystem.y_pos += 0.0005;
        }, 10);
        if (isAme) {
            mp.events.callRemote(NotificationSystem._ameServerEvent, ameText);
            if (NotificationSystem.ameCancelTimeout) {
                clearTimeout(NotificationSystem.ameCancelTimeout);
                NotificationSystem.ameCancelTimeout = undefined;
            }
            NotificationSystem.ameCancelTimeout = setTimeout(() => {
                mp.events.callRemote(NotificationSystem._ameServerEvent, null);
                NotificationSystem.ameCancelTimeout = undefined;
            }, NotificationSystem.ameDuration_seconds * 1000);
        }
    }
    static resetData() {
        NotificationSystem.interval = undefined;
        NotificationSystem.x_pos = 0.5;
        NotificationSystem.y_pos = 0.5;
        NotificationSystem.opacity = 255;
        NotificationSystem.scale = 0.55;
        NotificationSystem.visible = false;
    }
    static handleRender() {
        if (NotificationSystem.visible && NotificationSystem.draw_text) {
            mp.game.graphics.drawText(NotificationSystem.draw_text, [NotificationSystem.x_pos, NotificationSystem.y_pos], {
                outline: true,
                font: 4,
                color: NotificationSystem.isRpText ? [220, 125, 225, NotificationSystem.opacity] : [255, 255, 255, NotificationSystem.opacity],
                scale: [NotificationSystem.scale, NotificationSystem.scale]
            });
        }
    }
}

class PhoneSystem {
    static LocalPlayer;
    static trackVehicleBlipDespawn_seconds = 40;
    static trackerBlip;
    static _phoneStatusIdentifer = "playerPhoneStatus";
    constructor() {
        PhoneSystem.LocalPlayer = mp.players.local;
        mp.events.add("phone:trackVehicle", PhoneSystem.trackVehicle);
        mp.events.add("entityStreamIn", PhoneSystem.handleStreamIn);
        mp.events.addDataHandler(PhoneSystem._phoneStatusIdentifer, PhoneSystem.handleDataHandler);
    }
    static async handleDataHandler(entity) {
        if (entity.type != "player")
            return;
        if (entity.getVariable(PhoneSystem._phoneStatusIdentifer)) {
            PhoneSystem.attachPhoneToPlayer(entity);
            PhoneSystem.playMobilePhoneAnim(entity);
        }
        else {
            PhoneSystem.resetEntityPhone(entity);
            entity.clearTasks();
        }
    }
    static async handleStreamIn(entity) {
        if (entity.type != "player")
            return;
        let phoneStatus = entity.getVariable(PhoneSystem._phoneStatusIdentifer);
        if (phoneStatus) {
            PhoneSystem.attachPhoneToPlayer(entity);
            PhoneSystem.playMobilePhoneAnim(entity);
        }
    }
    static async attachPhoneToPlayer(entity) {
        if (entity._mobilePhone) {
            PhoneSystem.resetEntityPhone(entity);
            await mp.game.waitAsync(50);
        }
        entity._mobilePhone = mp.objects.new('p_amb_phone_01', entity.position, {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: entity.dimension
        });
        for (let i = 0; entity._mobilePhone && entity._mobilePhone.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        await mp.game.waitAsync(250);
        let pos = new mp.Vector3(0.1500, 0.02, -0.02);
        let rot = new mp.Vector3(71, 96.0, 169);
        entity._mobilePhone.attachTo(entity.handle, 71, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, true, true, false, false, 0, true);
    }
    static async playMobilePhoneAnim(entity) {
        for (let i = 0; entity.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        mp.game.streaming.requestAnimDict("cellphone@");
        entity.taskPlayAnim("cellphone@", "cellphone_text_read_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false);
    }
    static async resetEntityPhone(entity) {
        if (entity._mobilePhone) {
            entity._mobilePhone.destroy();
            entity._mobilePhone = null;
        }
    }
    static trackVehicle(plate, x, y, z) {
        if (PhoneSystem.trackerBlip) {
            NotificationSystem.createNotification("~r~You are already tracking a vehicle.", false);
            return;
        }
        BrowserSystem.sendNotif(`You have tracked your vehicle [${plate}], it has been marked on the map. The blip will despawn in ${PhoneSystem.trackVehicleBlipDespawn_seconds} seconds.`, true, true, 6000);
        PhoneSystem.trackerBlip = mp.blips.new(523, new mp.Vector3(x, y, z), {
            alpha: 255,
            color: 49,
            dimension: 0,
            drawDistance: 1.0,
            name: `Tracked vehicle [${plate}]`,
            rotation: 0,
            scale: 1.0,
            shortRange: false
        });
        setTimeout(() => {
            if (PhoneSystem.trackerBlip) {
                PhoneSystem.trackerBlip.destroy();
                PhoneSystem.trackerBlip = null;
            }
        }, PhoneSystem.trackVehicleBlipDespawn_seconds * 1000);
    }
}

const getUserCharacterData = () => {
    let sharedData = mp.players.local.getVariable(_sharedCharacterDataIdentifier);
    if (!sharedData)
        return;
    return sharedData;
};

const validateKeyPress = (testForVehicle = false, testForPhone = true, testForInjured = false) => {
    let localCharData = getUserCharacterData();
    if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
        return false;
    }
    if (testForPhone && mp.players.local.getVariable(PhoneSystem._phoneStatusIdentifer)) {
        return false;
    }
    if (mp.game.ui.isPauseMenuActive()) {
        return false;
    }
    if (mp.players.local.isTypingInTextChat) {
        return false;
    }
    if (testForVehicle && mp.players.local.vehicle) {
        return false;
    }
    if (testForInjured && localCharData && localCharData.injured_timer > 0) {
        return false;
    }
    return true;
};

class AdminRank {
    static adminRanksList = ["None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "Developer"];
    static adminRanksColours = ["", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff", "#c096ff"];
    static getAdminRankInfo(rankId) {
        if (rankId > 0 && rankId <= AdminRank.adminRanksList.length) {
            return { rank: AdminRank.adminRanksList[rankId], colour: AdminRank.adminRanksColours[rankId] };
        }
    }
}

class AdminSystem {
    static LocalPlayer;
    static userData;
    static viewReportsEvent = "server:viewReports";
    constructor() {
        AdminSystem.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.F9, false, AdminSystem.viewActiveReports);
        mp.events.add("render", AdminSystem.renderTextOnScreen);
        mp.events.add("entityStreamIn", AdminSystem.handleEntityStream);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, AdminSystem.handleFlyStart);
    }
    static viewActiveReports() {
        if (!validateKeyPress())
            return;
        let userData = getUserData();
        if (!userData)
            return;
        if (userData.admin_status > AdminRanks.admin_None) {
            mp.events.callRemote(AdminSystem.viewReportsEvent);
        }
    }
    static handleFlyStart(entity, value) {
        if (entity.type != "player" || value == null)
            return;
        if (value.isFlying) {
            entity.setAlpha(0);
        }
        else {
            entity.setAlpha(255);
        }
    }
    static renderTextOnScreen() {
        AdminSystem.userData = getUserData();
        if (AdminSystem.userData?.adminDuty) {
            let poz_x = AdminSystem.LocalPlayer.position.x.toFixed(1);
            let poz_y = AdminSystem.LocalPlayer.position.y.toFixed(1);
            let poz_z = AdminSystem.LocalPlayer.position.z.toFixed(1);
            let adminRankData = AdminRank.getAdminRankInfo(AdminSystem.userData.admin_status);
            if (!adminRankData)
                return;
            let positionString = `~r~X:~w~ ${poz_x} ~r~Y:~w~ ${poz_y} ~r~Z:~w~ ${poz_z} ~r~ROT:~w~ ${AdminSystem.LocalPlayer.getRotation(5).z.toFixed(1)}`;
            let msg = `~r~On duty as ~w~<font color="${adminRankData.colour}">${adminRankData.rank}~r~ ${AdminSystem.userData.admin_name} ${AdminSystem.userData.isFlying ? "\n~g~[Fly enabled]~w~" : ""}`;
            mp.game.graphics.drawText(msg, [0.5, 0.90], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.65, 0.65],
                outline: false
            });
            mp.game.graphics.drawText(positionString, [0.5, AdminSystem.userData.isFlying ? 0.87 : 0.94], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.45, 0.45],
                outline: false
            });
        }
    }
    static handleEntityStream(entity) {
        if (entity.type != "player")
            return;
        let streamedEntityData = getTargetData(entity);
        if (!streamedEntityData)
            return;
    }
}

class Camera {
    static Current_Cam;
    identifier;
    position;
    pointAtCoord;
    camera;
    isMoving;
    range;
    speed;
    constructor(identifier, position, pointAtCoord) {
        this.identifier = identifier;
        this.position = position;
        this.pointAtCoord = pointAtCoord;
        this.isMoving = false;
        this.range = 10;
        this.speed = 1.1;
        this.create();
        Camera.Current_Cam = this;
        mp.events.add("render", Camera.handleCameraMovement);
    }
    static handleCameraMovement() {
        if (Camera.Current_Cam === null || !Camera.Current_Cam.isMoving)
            return;
        let position = Camera.Current_Cam.camera.getCoord();
        Camera.Current_Cam.camera.setCoord(position.x + Camera.Current_Cam.speed, position.y, position.z);
        if (position.x + Camera.Current_Cam.speed >= Camera.Current_Cam.position.x + (Camera.Current_Cam.range / 2)
            || position.x + Camera.Current_Cam.speed <= Camera.Current_Cam.position.x - (Camera.Current_Cam.range / 2)) {
            Camera.Current_Cam.speed *= -1;
        }
    }
    create() {
        if (Camera.Current_Cam !== null && this.camera && mp.cameras.exists(this.camera)) {
            this.delete();
        }
        this.camera = mp.cameras.new(this.identifier, this.position, new mp.Vector3(0, 0, 0), 40);
        this.camera.pointAtCoord(this.pointAtCoord.x, this.pointAtCoord.y, this.pointAtCoord.z);
        this.camera.setMotionBlurStrength(1000);
        this.setActive();
    }
    setActive() {
        this.camera?.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, false, false);
        mp.game.streaming.setFocusArea(this.position.x, this.position.y, this.position.z, 0, 0, 0);
    }
    startMoving(range) {
        this.isMoving = true;
        this.range = range;
    }
    stopMoving() {
        this.isMoving = false;
        this.range = 0.0;
    }
    delete() {
        if (this.camera && mp.cameras.atHandle(this.camera.handle)) {
            this.camera.destroy();
        }
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
        mp.game.invoke(CLEAR_FOCUS);
        Camera.Current_Cam = null;
    }
}

const toggleChat = (toggle) => {
    if (mp.players.local.browserInstance) {
        let playerBrowser = mp.players.local.browserInstance;
        playerBrowser.execute(`appSys.commit("setUiState", {
			_stateKey: "chatEnabled",
			status: ${toggle}
		})`);
    }
};

const getCameraOffset = (pos, angle, dist) => {
    angle = angle * 0.0174533;
    pos.y = pos.y + dist * Math.sin(angle);
    pos.x = pos.x + dist * Math.cos(angle);
    return pos;
};

const setGuiState = (toggle) => {
    BrowserSystem._browserInstance.execute(`appSys.commit("setGuiState", {
		toggle: ${toggle}
	})`);
};

const setUiStateChange = (stateName, toggle) => {
    if (BrowserSystem._browserInstance) {
        let LocalPlayer = mp.players.local;
        if (LocalPlayer.browserCurrentState == stateName && toggle) {
            return;
        }
        if (toggle) {
            LocalPlayer.browserCurrentState = stateName;
        }
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
			_uiState: "${stateName}",
			toggle: ${toggle}
		})`);
    }
};

const _storage_key = "AutoLoginToken";
class PlayerAuthentication {
    static LoginCamera;
    static creationCam;
    static LocalPlayer;
    static LocalStorage;
    static characterCreationPosition = new mp.Vector3(-38.6, -590.5, 78.8);
    static _cameraSwitchInterval = 500;
    static _switchCamCmd = "swcm";
    static _logoutIdentifier = "playerIsLoggingOut";
    static _currentCam = 0;
    static cameraPositions = [
        new mp.Vector3(-79.9, -1079.5, 310.2),
        new mp.Vector3(407.3, 6009.5, 940.0),
        new mp.Vector3(678.2, 928.0, 458.3),
        new mp.Vector3(1893.8, 3309.4, 323.1)
    ];
    static cameraPointAtPositions = [
        new mp.Vector3(-74.8, -819.2, 326.2),
        new mp.Vector3(501.7, 5603.7, 767.9),
        new mp.Vector3(728.1, 1213.9, 328.8),
        new mp.Vector3(1869.9, 3711.3, 120.5)
    ];
    constructor() {
        PlayerAuthentication.LocalPlayer = mp.players.local;
        PlayerAuthentication.LocalStorage = mp.storage;
        mp.events.add("render", PlayerAuthentication.handleUnauthed);
        mp.events.add("playerReady", PlayerAuthentication.handleLoginStart);
        mp.events.add("client:loginEnd", PlayerAuthentication.endClientLogin);
        mp.events.add("client:setCharacterCreation", PlayerAuthentication.setCharacterCreation);
        mp.events.add("client:setBackToSelection", PlayerAuthentication.setBackToCharacterSelection);
        mp.events.add("client:loginCameraStart", PlayerAuthentication.handleCameraStart);
        mp.events.add("client:setAuthKey", PlayerAuthentication.setAuthenticationKey);
        mp.events.add("consoleCommand", PlayerAuthentication.consoleCommand);
        mp.events.addDataHandler(PlayerAuthentication._logoutIdentifier, PlayerAuthentication.handleLogoutHandler);
    }
    static handleLogoutHandler(entity, val) {
        if (entity.type == "player" && val) {
            entity.freezePosition(true);
        }
        else {
            entity.freezePosition(false);
        }
    }
    static handleUnauthed() {
        if (!getUserCharacterData()) {
            PlayerAuthentication.LocalPlayer.freezePosition(true);
            toggleChat(false);
            setGuiState(false);
            mp.game.ui.displayRadar(false);
        }
    }
    static consoleCommand(command) {
        if (command == PlayerAuthentication._switchCamCmd && !getUserCharacterData()) {
            PlayerAuthentication.LoginCamera?.delete();
            PlayerAuthentication._currentCam >= PlayerAuthentication.cameraPositions.length - 1 ? PlayerAuthentication._currentCam = 0 : PlayerAuthentication._currentCam++;
            PlayerAuthentication.LoginCamera = new Camera('loginCam', PlayerAuthentication.cameraPositions[PlayerAuthentication._currentCam], PlayerAuthentication.cameraPointAtPositions[PlayerAuthentication._currentCam]);
            PlayerAuthentication.LoginCamera.startMoving(7100.0);
            PlayerAuthentication.LoginCamera.setActive();
            PlayerAuthentication.freezeAndBlurClient();
        }
    }
    static setAuthenticationKey(newAuthKey) {
        PlayerAuthentication.LocalStorage.data[_storage_key] = newAuthKey;
    }
    static setCharacterCreation() {
        PlayerAuthentication.endClientLogin();
        BrowserSystem.pushRouter("/charcreation");
        PlayerAuthentication.LocalPlayer.position = PlayerAuthentication.characterCreationPosition;
        let camValues = { angle: PlayerAuthentication.LocalPlayer.getRotation(2).z + 90, dist: 2.6, height: 0.2 };
        let pos = getCameraOffset(new mp.Vector3(PlayerAuthentication.LocalPlayer.position.x, PlayerAuthentication.LocalPlayer.position.y, PlayerAuthentication.LocalPlayer.position.z + camValues.height), camValues.angle, camValues.dist);
        PlayerAuthentication.creationCam = new Camera('selectCam', new mp.Vector3(pos.x, pos.y, pos.z), PlayerAuthentication.LocalPlayer.position);
    }
    static setBackToCharacterSelection() {
        PlayerAuthentication.LoginCamera?.delete();
        PlayerAuthentication.freezeAndBlurClient();
        PlayerAuthentication.handleCameraStart();
    }
    static handleLoginStart() {
        setUiStateChange("state_loginPage", true);
        PlayerAuthentication.handleCameraStart();
        mp.events.callRemote("server:handlePlayerJoining", PlayerAuthentication.LocalStorage.data[_storage_key]);
    }
    static handleCameraStart() {
        PlayerAuthentication.LoginCamera?.delete();
        let randomSelect = Math.floor(Math.random() * PlayerAuthentication.cameraPositions.length);
        PlayerAuthentication.LoginCamera = new Camera('loginCam', PlayerAuthentication.cameraPositions[randomSelect], PlayerAuthentication.cameraPointAtPositions[randomSelect]);
        PlayerAuthentication.LoginCamera.startMoving(7100.0);
        PlayerAuthentication.LoginCamera.setActive();
        PlayerAuthentication.freezeAndBlurClient();
    }
    static freezeAndBlurClient() {
        mp.game.ui.displayRadar(false);
        mp.gui.cursor.show(true, true);
        PlayerAuthentication.LocalPlayer.freezePosition(true);
        PlayerAuthentication.LocalPlayer.setAlpha(0);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.graphics.transitionToBlurred(100);
        PlayerAuthentication.LocalPlayer.freezePosition(true);
    }
    static endClientLogin() {
        PlayerAuthentication.LocalPlayer.freezePosition(false);
        PlayerAuthentication.LocalPlayer.setAlpha(255);
        mp.game.graphics.transitionFromBlurred(100);
        mp.gui.cursor.show(false, false);
        BrowserSystem.pushRouter("/");
        PlayerAuthentication.LoginCamera?.delete();
        PlayerAuthentication.LocalPlayer.freezePosition(false);
    }
}

const getTargetCharacterData = (target) => {
    let sharedData = target.getVariable(_sharedCharacterDataIdentifier);
    if (!sharedData)
        return;
    return sharedData;
};

const distBetweenCoords = (x, y) => {
    return mp.game.gameplay.getDistanceBetweenCoords(x.x, x.y, x.z, y.x, y.y, y.z, false);
};

class VoiceSystem {
    static Localplayer;
    static Use3d = true;
    static UseAutoVolume = false;
    static MaxRange = 20;
    static VoiceVol = 1.0;
    static VoiceChatKey = _control_ids.NBIND;
    static _voiceListeners = [];
    static addListenerEvent = 'server:voiceAddVoiceListener';
    static removeListenerEvent = 'server:voiceRemoveVoiceListener';
    static togVoiceEvent = 'server:togVoiceStatus';
    static _voiceToggleIdentifier = 'voipIsTalking';
    constructor() {
        VoiceSystem.Localplayer = mp.players.local;
        mp.keys.bind(VoiceSystem.VoiceChatKey, false, () => VoiceSystem.toggleVoice(true));
        mp.keys.bind(VoiceSystem.VoiceChatKey, true, () => VoiceSystem.toggleVoice(false));
        mp.events.add('entityStreamOut', VoiceSystem.handleStreamOut);
        mp.events.add('entityStreamIn', VoiceSystem.handleStreamIn);
        mp.events.addDataHandler(VoiceSystem._voiceToggleIdentifier, VoiceSystem.handleDataHandler);
        mp.events.add('playerQuit', VoiceSystem.handlePlayerLeave);
        setInterval(() => {
            mp.players.forEachInStreamRange((player) => {
                if (player != VoiceSystem.Localplayer) {
                    if (!player.isListening) {
                        let dist = mp.game.system.vdist(player.position.x, player.position.y, player.position.z, VoiceSystem.Localplayer.position.x, VoiceSystem.Localplayer.position.y, VoiceSystem.Localplayer.position.z);
                        if (dist <= VoiceSystem.MaxRange) {
                            VoiceSystem.addListener(player);
                        }
                    }
                }
            });
            VoiceSystem._voiceListeners.forEach((player) => {
                if (player.handle !== 0) {
                    const playerPos = player.position;
                    let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, VoiceSystem.Localplayer.position.x, VoiceSystem.Localplayer.position.y, VoiceSystem.Localplayer.position.z);
                    if (dist > VoiceSystem.MaxRange) {
                        VoiceSystem.removeListener(player, true);
                    }
                    else {
                        player.voiceVolume = 1 - dist / VoiceSystem.MaxRange;
                    }
                }
                else {
                    VoiceSystem.removeListener(player, true);
                }
            });
        }, 500);
    }
    static handleDataHandler(entity, tog) {
        if (entity.type != 'player')
            return;
        if (!tog) {
            entity.playFacialAnim('mic_chatter', 'mp_facial');
        }
        else {
            entity.playFacialAnim('mood_normal_1', 'facials@gen_male@variations@normal');
        }
    }
    static handleStreamOut(entity) {
        if (entity.type != 'player')
            return;
        entity.playFacialAnim('mood_normal_1', 'facials@gen_male@variations@normal');
    }
    static handleStreamIn(entity) {
        if (entity.type != 'player')
            return;
        let voiceStatus = entity.getVariable(VoiceSystem._voiceToggleIdentifier);
        if (!voiceStatus) {
            entity.playFacialAnim('mic_chatter', 'mp_facial');
        }
    }
    static addListener(player) {
        VoiceSystem._voiceListeners.push(player);
        player.isListening = true;
        mp.events.callRemote(VoiceSystem.addListenerEvent, player);
        {
            player.voiceVolume = 1.0;
        }
        {
            player.voice3d = true;
        }
    }
    static removeListener(player, notify) {
        let idx = VoiceSystem._voiceListeners.indexOf(player);
        if (idx !== -1) {
            VoiceSystem._voiceListeners.splice(idx, 1);
        }
        player.isListening = false;
        if (notify) {
            mp.events.callRemote(VoiceSystem.removeListenerEvent, player);
        }
    }
    static toggleVoice(tog) {
        if (!validateKeyPress(false, false))
            return;
        let characterData = getUserCharacterData();
        if (characterData) {
            mp.voiceChat.muted = tog;
            mp.events.callRemote(VoiceSystem.togVoiceEvent, tog);
        }
    }
    static handlePlayerLeave(player) {
        if (player.isListening) {
            VoiceSystem.removeListener(player, false);
        }
    }
}

class ScaleForm {
    static LocalPlayer;
    static midsizedMessageScaleform = null;
    static msgInit = 0;
    static msgDuration = 5000;
    static msgAnimatedOut = false;
    static msgBgColor = 0;
    static bigMessageScaleform = null;
    static bigMsgInit = 0;
    static bigMsgDuration = 5000;
    static bigMsgAnimatedOut = false;
    constructor() {
        mp.events.add("ShowMidsizedMessage", ScaleForm.showMidsizedScaleform);
        mp.events.add("ShowMidsizedShardMessage", ScaleForm.showMidsizedScaleform);
        mp.events.add("ShowWeaponPurchasedMessage", ScaleForm.showWeaponPurchaseMessage);
        mp.events.add("ShowPlaneMessage", ScaleForm.showPlaneMessage);
        mp.events.add("ShowShardMessage", ScaleForm.showShardMessage);
        mp.events.add("render", ScaleForm.handleRender);
    }
    static handleRender() {
        if (ScaleForm.midsizedMessageScaleform != null) {
            ScaleForm.midsizedMessageScaleform.renderFullscreen();
            if (ScaleForm.msgInit > 0 && Date.now() - ScaleForm.msgInit > ScaleForm.msgDuration) {
                if (!ScaleForm.msgAnimatedOut) {
                    ScaleForm.midsizedMessageScaleform.callFunction("SHARD_ANIM_OUT", ScaleForm.msgBgColor);
                    ScaleForm.msgAnimatedOut = true;
                    ScaleForm.msgDuration += 750;
                }
                else {
                    ScaleForm.msgInit = 0;
                    ScaleForm.midsizedMessageScaleform.dispose();
                    ScaleForm.midsizedMessageScaleform = null;
                }
            }
        }
        if (ScaleForm.bigMessageScaleform != null) {
            ScaleForm.bigMessageScaleform.renderFullscreen();
            if (ScaleForm.bigMsgInit > 0 && Date.now() - ScaleForm.bigMsgInit > ScaleForm.bigMsgDuration) {
                if (!ScaleForm.bigMsgAnimatedOut) {
                    ScaleForm.bigMessageScaleform.callFunction("TRANSITION_OUT");
                    ScaleForm.bigMsgAnimatedOut = true;
                    ScaleForm.bigMsgDuration += 750;
                }
                else {
                    ScaleForm.bigMsgInit = 0;
                    ScaleForm.bigMessageScaleform.dispose();
                    ScaleForm.bigMessageScaleform = null;
                }
            }
        }
    }
    static showWeaponPurchaseMessage(title, weaponName, weaponHash, time = 5000) {
        if (ScaleForm.bigMessageScaleform == null)
            ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_WEAPON_PURCHASED", title, weaponName, weaponHash);
        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }
    static showPlaneMessage(title, planeName, planeHash, time = 5000) {
        if (ScaleForm.bigMessageScaleform == null)
            ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_PLANE_MESSAGE", title, planeName, planeHash);
        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }
    static showShardMessage(title, message, titleColor, bgColor, time = 5000) {
        if (ScaleForm.bigMessageScaleform == null)
            ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_SHARD_CENTERED_MP_MESSAGE", title, message, titleColor, bgColor);
        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }
    static showMidsizedScaleform(title, message, time = 5000) {
        if (ScaleForm.midsizedMessageScaleform == null)
            ScaleForm.midsizedMessageScaleform = new BasicScaleform("midsized_message");
        ScaleForm.midsizedMessageScaleform.callFunction("SHOW_MIDSIZED_MESSAGE", title, message);
        ScaleForm.msgInit = Date.now();
        ScaleForm.msgDuration = time;
        ScaleForm.msgAnimatedOut = false;
    }
    static showMidsizedShard(title, message, bgColor, useDarkerShard, condensed, time = 5000) {
        if (ScaleForm.midsizedMessageScaleform == null)
            ScaleForm.midsizedMessageScaleform = new BasicScaleform("midsized_message");
        ScaleForm.midsizedMessageScaleform.callFunction("SHOW_SHARD_MIDSIZED_MESSAGE", title, message, bgColor, useDarkerShard, condensed);
        ScaleForm.msgInit = Date.now();
        ScaleForm.msgDuration = time;
        ScaleForm.msgAnimatedOut = false;
        ScaleForm.msgBgColor = bgColor;
    }
    static isActive() {
        return BasicScaleform.handle && mp.game.graphics.hasScaleformMovieLoaded(BasicScaleform.handle);
    }
}
class BasicScaleform {
    static handle;
    constructor(scaleformName) {
        BasicScaleform.handle = mp.game.graphics.requestScaleformMovie(scaleformName);
        while (!mp.game.graphics.hasScaleformMovieLoaded(BasicScaleform.handle))
            mp.game.wait(0);
    }
    callFunction(functionName, ...args) {
        mp.game.graphics.pushScaleformMovieFunction(BasicScaleform.handle, functionName);
        args.forEach(arg => {
            switch (typeof arg) {
                case "string": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterString(arg);
                    break;
                }
                case "boolean": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterBool(arg);
                    break;
                }
                case "number": {
                    if (Number(arg) === arg && arg % 1 !== 0) {
                        mp.game.graphics.pushScaleformMovieFunctionParameterFloat(arg);
                    }
                    else {
                        mp.game.graphics.pushScaleformMovieFunctionParameterInt(arg);
                    }
                }
            }
        });
        mp.game.graphics.popScaleformMovieFunctionVoid();
    }
    renderFullscreen() {
        mp.game.graphics.drawScaleformMovieFullscreen(BasicScaleform.handle, 255, 255, 255, 255, -1);
    }
    dispose() {
        mp.game.graphics.setScaleformMovieAsNoLongerNeeded(BasicScaleform.handle);
    }
}

const getWaterAndHungerData = (player) => {
    return player.getVariable(_sharedHungerDataIdentifier);
};

const getTimeUnix = () => {
    return Math.floor(new Date().getTime() / 1000);
};

class GuiSystem {
    static LocalPlayer;
    static hudToggle = true;
    constructor() {
        GuiSystem.LocalPlayer = mp.players.local;
        mp.events.add("render", GuiSystem.fillGuiRenderValues);
        mp.events.add("gui:toggleHudComplete", GuiSystem.toggleHudComplete);
        mp.keys.bind(_control_ids.F10, false, GuiSystem.toggleHud);
    }
    static toggleHud() {
        if (!validateKeyPress())
            return;
        GuiSystem.hudToggle = !GuiSystem.hudToggle;
        GuiSystem.toggleHudComplete(GuiSystem.hudToggle, false, true);
    }
    static toggleHudComplete(toggle, notif = false, checkForScaleFormAndSwitch = true) {
        if (checkForScaleFormAndSwitch && (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE) || ScaleForm.isActive()))
            return;
        let browser = BrowserSystem._browserInstance;
        GuiSystem.hudToggle = toggle;
        if (browser) {
            mp.game.ui.displayRadar(toggle);
            GuiSystem.LocalPlayer.guiState = toggle;
            toggleChat(toggle);
            browser.execute(`appSys.commit('setUiState', {
				_stateKey: "guiEnabled",
				status: ${toggle}
			})`);
            if (notif) {
                NotificationSystem.createNotification(`You turned your HUD ${toggle ? "on" : "off"}`);
            }
        }
    }
    static fillGuiRenderValues() {
        if (ScaleForm.isActive()) {
            GuiSystem.toggleHudComplete(false, false, false);
            return;
        }
        let PlayerData = getUserData();
        let characterData = getUserCharacterData();
        if (!PlayerData || !characterData)
            return;
        const streetData = GuiSystem.getStreetName();
        let guiData = {
            direction: GuiSystem.getCompassDirection(),
            isFrozen: PlayerData.isFrozen,
            playerId: GuiSystem.LocalPlayer.remoteId,
            unix: getTimeUnix(),
            zoneName: streetData.zoneName,
            zoneNameTwo: streetData.zoneTwo,
            fps: GuiSystem.LocalPlayer.fps,
            voiceMuted: mp.voiceChat.muted
        };
        if (mp.game.invoke(IS_RADAR_ENABLED) && !mp.game.invoke(IS_RADAR_HIDDEN)) {
            let hungerAndThirst = getWaterAndHungerData(GuiSystem.LocalPlayer);
            if (hungerAndThirst) {
                BrowserSystem.handleObjectToBrowser("player_water", hungerAndThirst.water);
                BrowserSystem.handleObjectToBrowser("player_hunger", hungerAndThirst.hunger);
                BrowserSystem.handleObjectToBrowser("player_data_gui", guiData);
            }
        }
    }
    static getStreetName() {
        let position = GuiSystem.LocalPlayer.position;
        let getStreet = mp.game.pathfind.getStreetNameAtCoord(position.x, position.y, position.z);
        let zoneName = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(position.x, position.y, position.z)).replace("'", "");
        let zoneTwo = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName) ? mp.game.ui.getStreetNameFromHashKey(getStreet.streetName) : "";
        return { getStreet, zoneName, zoneTwo };
    }
    static getCompassDirection() {
        let direction = "";
        let heading = mp.players.local.getHeading();
        if (GuiSystem.LocalPlayer.heading != 0) {
            if (heading < 45 || heading > 315) {
                direction = "N";
            }
            if (heading > 45 && heading < 135) {
                direction = "W";
            }
            if (heading > 135 && heading < 225) {
                direction = "S";
            }
            if (heading > 225 && heading < 315) {
                direction = "E";
            }
        }
        return direction;
    }
}

const isFlipped = (vehicle) => {
    if (Math.trunc(vehicle.getRotation(2).y) > 80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === 1 || Math.trunc(vehicle.getRotation(2).y) < -80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === -1) {
        return true;
    }
    return false;
};

class VehicleSystems {
    static LocalPlayer;
    static GameControls;
    static beltToggle;
    static vehicleOldPos;
    static updateVehicleDistEvent = "server:updateVehicleDistance";
    static toggleSeatBeltEvent = "vehicle:toggleSeatBelt";
    static _seatBeltIdentifier = "playerIsWearingSeatBelt";
    static updateDistInteral_seconds = 20;
    static blockVehicleSeatBelts = [13, 14, 15, 16, 21, 8];
    constructor() {
        VehicleSystems.LocalPlayer = mp.players.local;
        VehicleSystems.GameControls = mp.game.controls;
        mp.events.add("render", VehicleSystems.handleRender);
        mp.events.add("playerLeaveVehicle", (veh) => VehicleSystems.beltToggle ? VehicleSystems.toggleSeatBelt(veh) : null);
        mp.events.add("playerEnterVehicle", VehicleSystems.handlePlayerEnterVehicle);
        mp.events.add("playerLeaveVehicle", VehicleSystems.handleExitDistCalc);
        mp.keys.bind(_control_ids.F, false, VehicleSystems.stopWindowBreaking);
        mp.keys.bind(_control_ids.J, false, VehicleSystems.toggleSeatBelt);
        setInterval(() => {
            if (!VehicleSystems.LocalPlayer.vehicle)
                return;
            mp.events.callRemote(VehicleSystems.updateVehicleDistEvent, JSON.stringify(VehicleSystems.vehicleOldPos));
            VehicleSystems.vehicleOldPos = VehicleSystems.LocalPlayer.vehicle.position;
        }, VehicleSystems.updateDistInteral_seconds * 1000);
    }
    static handlePlayerEnterVehicle(vehicle, seat) {
        if (!vehicle)
            return;
        VehicleSystems.vehicleOldPos = vehicle.position;
    }
    static handleExitDistCalc(vehicle) {
        if (!vehicle)
            return;
        mp.events.callRemote(VehicleSystems.updateVehicleDistEvent, JSON.stringify(VehicleSystems.vehicleOldPos));
    }
    static toggleSeatBelt(vehicle) {
        if (VehicleSystems.LocalPlayer.isTypingInTextChat)
            return;
        if (!vehicle) {
            vehicle = VehicleSystems.LocalPlayer.vehicle;
        }
        if (vehicle) {
            if (VehicleSystems.blockVehicleSeatBelts.indexOf(vehicle.getClass()) !== -1) {
                NotificationSystem.createNotification("~r~This vehicle doesn't have a seatbelt!", false);
                return;
            }
            VehicleSystems.beltToggle = !VehicleSystems.beltToggle;
            mp.events.callRemote(VehicleSystems.toggleSeatBeltEvent, VehicleSystems.beltToggle);
            VehicleSystems.LocalPlayer.setConfigFlag(CF_PED_FLAG_CAN_FLY_THRU_WINDSCREEN, !VehicleSystems.beltToggle);
            NotificationSystem.createNotification(`You have ${VehicleSystems.beltToggle ? "buckled" : "unbuckled"} your seat belt.`, true, true, `${VehicleSystems.beltToggle ? "Buckles" : "Unbuckles"} seatbelt.`);
        }
    }
    static handleRender() {
        if (VehicleSystems.LocalPlayer.vehicle && VehicleSystems.LocalPlayer.vehicle.getHealth() <= 0) {
            VehicleSystems.LocalPlayer.vehicle.setUndriveable(true);
        }
        if (VehicleSystems.LocalPlayer.vehicle && isFlipped(VehicleSystems.LocalPlayer.vehicle)) {
            VehicleSystems.disableControls();
        }
        if (VehicleSystems.LocalPlayer.vehicle) {
            VehicleSystems.turnOffRadio();
        }
    }
    static stopWindowBreaking() {
        const vehHandle = mp.players.local.getVehicleIsTryingToEnter();
        if (vehHandle) {
            const vehicle = mp.vehicles.atHandle(vehHandle);
            if (!vehicle)
                return;
            if (vehicle.getDoorLockStatus() === 2) {
                let seat = -1;
                let e = 0;
                let interval = setInterval(() => {
                    if (e === 15) {
                        clearInterval(interval);
                        return;
                    }
                    if (vehicle.getDoorLockStatus() === 1) {
                        let data = mp.game.vehicle.getVehicleModelMaxNumberOfPassengers(vehicle.model);
                        for (let i = -1, l = data; i < l; i++) {
                            let isFree = vehicle.isSeatFree(i);
                            if (isFree) {
                                seat = i;
                                VehicleSystems.LocalPlayer.taskEnterVehicle(vehicle.handle, 5000, seat, 2, 1, 0);
                                clearInterval(interval);
                                return;
                            }
                        }
                    }
                    e++;
                }, 200);
            }
        }
    }
    static disableControls() {
        VehicleSystems.GameControls.disableControlAction(32, 59, true);
        VehicleSystems.GameControls.disableControlAction(32, 60, true);
        VehicleSystems.GameControls.disableControlAction(32, 61, true);
        VehicleSystems.GameControls.disableControlAction(32, 62, true);
        VehicleSystems.GameControls.disableControlAction(0, 59, true);
        VehicleSystems.GameControls.disableControlAction(0, 60, true);
        VehicleSystems.GameControls.disableControlAction(0, 61, true);
        VehicleSystems.GameControls.disableControlAction(0, 62, true);
        VehicleSystems.GameControls.disableControlAction(32, 63, true);
        VehicleSystems.GameControls.disableControlAction(0, 63, true);
    }
    static turnOffRadio() {
        VehicleSystems.LocalPlayer.vehicle.setAlarm(true);
        mp.game.audio.setRadioToStationName("OFF");
        mp.game.audio.setUserRadioControlEnabled(false);
    }
}

class WeaponSystem {
    static LocalPlayer;
    static _switchAnimIdentifer = "weaponSwitchAnim";
    constructor() {
        WeaponSystem.LocalPlayer = mp.players.local;
        mp.events.add("entityStreamIn", WeaponSystem.handleStreamIn);
        mp.events.add("render", WeaponSystem.handleRender);
        mp.events.addDataHandler(WeaponSystem._switchAnimIdentifer, WeaponSystem.handleDataHandler);
    }
    static handleRender() {
        // mp.game1.weapon.unequipEmptyWeapons = false;
        if (WeaponSystem.LocalPlayer.vehicle && WeaponSystem.LocalPlayer.vehicle.getPedInSeat(-1) == WeaponSystem.LocalPlayer.handle) {
            WeaponSystem.disableGunShooting();
        }
    }
    static handleStreamIn(entity) {
        if (entity.type != "player")
            return;
        if (entity.getVariable(WeaponSystem._switchAnimIdentifer)) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }
    static handleDataHandler(entity, data) {
        if (entity.type == "player" && data) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }
    static async playSwitchAnim(player) {
        mp.game.streaming.requestAnimDict('reaction@intimidation@1h');
        player.taskPlayAnim('reaction@intimidation@1h', 'intro', 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false);
    }
    static disableGunShooting() {
        mp.game.controls.disableControlAction(1, 25, true);
        mp.game.controls.disableControlAction(1, 67, true);
        mp.game.controls.disableControlAction(1, 114, true);
        mp.game.controls.disableControlAction(1, 68, true);
        mp.game.controls.disableControlAction(0, 24, true);
        mp.game.controls.disableControlAction(0, 69, true);
        mp.game.controls.disableControlAction(0, 70, true);
        mp.game.controls.disableControlAction(0, 92, true);
        mp.game.controls.disableControlAction(0, 140, true);
        mp.game.controls.disableControlAction(0, 141, true);
        mp.game.controls.disableControlAction(0, 142, true);
        mp.game.controls.disableControlAction(0, 257, true);
        mp.game.controls.disableControlAction(0, 263, true);
        mp.game.controls.disableControlAction(0, 265, true);
        mp.game.controls.disableControlAction(0, 68, true);
        mp.game.controls.disableControlAction(0, 70, true);
    }
}

class DeathSystem {
    static LocalPlayer;
    static _injuredIntervalUpdate_seconds = 10;
    static _animCheck_seconds = 5;
    static _injuredInterval;
    static _saveInterval;
    static injuredTimer;
    static saveInjuredEvent = "server:saveInjuredTime";
    static injuredAnim = "combat@damage@writheidle_a";
    static _lib_injuredAnim = "writhe_idle_a";
    constructor() {
        DeathSystem.LocalPlayer = mp.players.local;
        mp.events.add({
            "render": DeathSystem.handleRender,
            "entityStreamIn": DeathSystem.handleStreamIn,
            "injured:startInterval": DeathSystem.handleIntervalStart,
            "injured:removeStatus": DeathSystem.removeIntervalStatus,
        });
        mp.events.addDataHandler(_sharedCharacterDataIdentifier, DeathSystem.handleDataHandler);
        mp.events.addDataHandler(PlayerAuthentication._logoutIdentifier, DeathSystem.handleLogoutDataHandler);
        setInterval(() => {
            mp.players.forEach(player => {
                let targetCharData = getTargetCharacterData(player);
                if (targetCharData && targetCharData.injured_timer > 0) {
                    DeathSystem.playDeathAnim(player);
                }
            });
        }, DeathSystem._animCheck_seconds * 1000);
    }
    static handleLogoutDataHandler(entity, logout) {
        if (entity.type === "player" && logout) {
            DeathSystem.removeIntervalStatus();
        }
    }
    static removeIntervalStatus() {
        if (DeathSystem._injuredInterval) {
            clearInterval(DeathSystem._injuredInterval);
            DeathSystem._injuredInterval = undefined;
        }
        DeathSystem.LocalPlayer.freezePosition(false);
    }
    static handleIntervalStart(time) {
        DeathSystem.playInjuredEffects();
        DeathSystem.turnGuiOnAfterScaleform();
        DeathSystem.LocalPlayer.freezePosition(true);
        DeathSystem.injuredTimer = time;
        DeathSystem._saveInterval = setInterval(() => {
            let characterData = getUserCharacterData();
            if (!characterData)
                return;
            characterData.injured_timer <= 0 && DeathSystem._saveInterval ? (clearInterval(DeathSystem._saveInterval), DeathSystem._saveInterval = undefined) : DeathSystem.injuredTimer--;
        }, 1000);
        DeathSystem._injuredInterval = setInterval(() => {
            mp.events.callRemote(DeathSystem.saveInjuredEvent);
        }, DeathSystem._injuredIntervalUpdate_seconds * 1000);
    }
    static handleRender() {
        mp.game.gameplay.setFadeOutAfterDeath(false);
        let characterData = getUserCharacterData();
        if (!characterData)
            return;
        if (characterData.injured_timer > 0) {
            DeathSystem.disableControls();
            WeaponSystem.disableGunShooting();
            DeathSystem.renderInjuredText();
            if (DeathSystem.LocalPlayer.vehicle && DeathSystem.LocalPlayer.vehicle.getPedInSeat(-1) == DeathSystem.LocalPlayer.handle) {
                VehicleSystems.disableControls();
                DeathSystem.LocalPlayer.vehicle.setUndriveable(true);
            }
        }
    }
    static async playInjuredEffects() {
        mp.game.cam.setCamEffect(1);
        ScaleForm.showShardMessage("~r~INJURED~w~", "You were injured", "", 0);
        mp.game.graphics.startScreenEffect('DeathFailMichaelIn', 60000, true);
        mp.game.audio.playSoundFrontend(-1, "Bed", "WastedSounds", true);
    }
    static async turnGuiOnAfterScaleform() {
        await mp.game.waitAsync(2500);
        if (ScaleForm.isActive()) {
            DeathSystem.turnGuiOnAfterScaleform();
        }
        else {
            GuiSystem.toggleHudComplete(true);
        }
    }
    static handleStreamIn(entity) {
        let characterData = getUserCharacterData();
        if (entity.type != "player" || !characterData)
            return;
        if (characterData.injured_timer > 0) {
            DeathSystem.playDeathAnim(entity);
        }
    }
    static handleDataHandler(entity, data) {
        if (entity.type != "player" || !data)
            return;
        if (entity.remoteId != DeathSystem.LocalPlayer.remoteId)
            return;
        if (data.injured_timer > 0) {
            DeathSystem.injuredTimer = data.injured_timer;
            DeathSystem.playDeathAnim(entity);
        }
        else {
            mp.game.graphics.stopAllScreenEffects();
        }
    }
    static async playDeathAnim(player) {
        for (let i = 0; player.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        mp.game.streaming.requestAnimDict(DeathSystem.injuredAnim);
        await mp.game.waitAsync(50);
        if (!player || !mp.players.atRemoteId(player.remoteId))
            return;
        player.taskPlayAnim(DeathSystem.injuredAnim, DeathSystem._lib_injuredAnim, 8.0, 1.0, -1, 1, 1.0, false, false, false);
    }
    static disableControls() {
        mp.game.controls.disableControlAction(0, 22, true); //Space
        mp.game.controls.disableControlAction(0, 23, true); //Veh Enter
        mp.game.controls.disableControlAction(0, 25, true); //Right Mouse
        mp.game.controls.disableControlAction(0, 44, true); //Q
        mp.game.controls.disableControlAction(2, 75, true); //Exit Vehicle
        mp.game.controls.disableControlAction(2, 140, true); //R
        mp.game.controls.disableControlAction(2, 141, true); //Left Mouse
        mp.game.controls.disableControlAction(0, 30, true); //Move LR
        mp.game.controls.disableControlAction(0, 31, true); //Move UD
    }
    static renderInjuredText() {
        if (!ScaleForm.isActive()) {
            mp.game.graphics.drawText(`~r~INJURED`, [0.5, 0.81], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.6, 0.6],
                outline: true
            });
            mp.game.graphics.drawText(`You will bleed out in ~HUD_COLOUR_ORANGE~${DeathSystem.injuredTimer}~w~ seconds.`, [0.5, 0.85], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.42, 0.42],
                outline: true
            });
        }
    }
}

class NameTags {
    static userData;
    static LocalPlayer;
    static ScreenRes;
    static requestNickEvent = 'server:requestPlayerNickname';
    static playerIsTypingState = 'playerIsTypingState';
    constructor() {
        NameTags.LocalPlayer = mp.players.local;
        NameTags.ScreenRes = mp.game.graphics.getScreenResolution();
        mp.nametags.enabled = false;
        mp.events.add('render', NameTags.renderNametags);
        mp.events.add('entityStreamIn', NameTags.handleStreamIn);
        mp.events.add('set:nickName', NameTags.handleNickNameSet);
        mp.events.add('sendWithNickName', NameTags.sendWithNick);
        mp.events.add('playerQuit', NameTags.sendQuitMessage);
    }
    static sendQuitMessage(playerQuitting, exitType, reason) {
        if (!playerQuitting || !getTargetCharacterData(playerQuitting))
            return;
        if (distBetweenCoords(NameTags.LocalPlayer.position, playerQuitting.position) > 25)
            return;
        mp.gui.chat.push('!{#f57b42}[Disconnected] !{white}' +
            NameTags.getPlayerNick(playerQuitting) +
            ' has ' +
            NameTags.formatExit(exitType, reason) +
            ' from the server!');
    }
    static sendWithNick(targetEnt, prefix, suffix) {
        if (!targetEnt)
            return;
        if (targetEnt == NameTags.LocalPlayer) {
            let characterData = getUserCharacterData();
            mp.gui.chat.push(prefix + characterData?.character_name.replace('_', ' ') + ' ' + suffix);
        }
        else {
            mp.gui.chat.push(prefix + NameTags.getPlayerNick(targetEnt) + suffix);
        }
    }
    static formatExit(exitType, reason) {
        let formattedReason = 'disconnected';
        switch (exitType) {
            case 'timeout': {
                formattedReason = 'timed out';
                break;
            }
            case 'kicked': {
                formattedReason = 'has been kicked ' + reason ? ' with reason ' + reason : '';
            }
        }
        return formattedReason;
    }
    static handleStreamIn(entity) {
        if (entity.type != 'player' || !getUserCharacterData())
            return;
        mp.events.callRemote(NameTags.requestNickEvent, entity);
    }
    static handleNickNameSet(entity, name) {
        if (entity.type != 'player' || !getTargetCharacterData(entity))
            return;
        entity._nickName = name;
    }
    static renderNametags() {
        if (NameTags.LocalPlayer.getVariable(NameTags.playerIsTypingState)) {
            DeathSystem.disableControls();
        }
        if (getUserCharacterData()?.loggingOut) {
            PlayerAuthentication.LocalPlayer.freezePosition(true);
        }
        mp.players.forEachInRange(NameTags.LocalPlayer.position, 20, (target) => {
            const targetUserData = getTargetData(target);
            const targetCharacterData = getTargetCharacterData(target);
            const targetPosition = target.position;
            const PlayerPosition = NameTags.LocalPlayer.position;
            if (!targetUserData || targetUserData.isFlying || !targetCharacterData)
                return;
            const distance = new mp.Vector3(PlayerPosition.x, PlayerPosition.y, PlayerPosition.z)
                .subtract(new mp.Vector3(targetPosition.x, targetPosition.y, targetPosition.z))
                .length();
            if ((distance < 8 || (targetUserData.adminDuty && distance < 32)) &&
                NameTags.LocalPlayer.id != target.id &&
                NameTags.LocalPlayer.hasClearLosTo(target.handle, 17)) {
                const index = target.getBoneIndex(12844);
                const nameTag = target.getWorldPositionOfBone(index);
                const position = mp.game.graphics.world3dToScreen2d(new mp.Vector3(nameTag.x, nameTag.y, nameTag.z + 0.4));
                if (!position)
                    return;
                let x = position.x;
                let y = position.y;
                let scale = distance / 25;
                if (scale < 0.6)
                    scale = 0.6;
                y -= scale * (0.005 * (NameTags.ScreenRes.y / 1080)) - parseInt('0.010');
                let voiceState = target.getVariable(VoiceSystem._voiceToggleIdentifier) ? '' : '~g~';
                let injuredState = targetCharacterData.injured_timer > 0 ? '~r~(( INJURED )) ~w~\n' : '';
                let defaultTagContent = injuredState + voiceState + NameTags.getPlayerNick(target);
                if (targetUserData.adminDuty) {
                    defaultTagContent = `~w~<font color="${_TEXT_CLOUD_ADMINBLUE}">[Staff]</font> ${voiceState} ${targetUserData.admin_name}`;
                }
                target.getVariable(NameTags.playerIsTypingState) ? (defaultTagContent += '\n ~m~(( Typing... ))~w~') : '';
                if (NameTags.LocalPlayer.guiState || targetUserData.adminDuty) {
                    if (target.getVariable(VehicleSystems._seatBeltIdentifier) && target.vehicle && distance < 5) {
                        if (!mp.game.graphics.hasStreamedTextureDictLoaded('3dtextures')) {
                            mp.game.graphics.requestStreamedTextureDict('3dtextures', true);
                        }
                        if (mp.game.graphics.hasStreamedTextureDictLoaded('3dtextures')) {
                            mp.game.graphics.drawSprite('3dtextures', 'mpgroundlogo_bikers', x, y - 0.064, 0.025, 0.025, 0, 0, 255, 0, 255, false);
                        }
                    }
                    mp.game.graphics.drawText(defaultTagContent, [x, target.getVariable(NameTags.playerIsTypingState) ? y - 0.032 : y], {
                        font: 4,
                        color: [255, 255, 255, targetUserData.adminDuty ? 255 : 180],
                        scale: [0.325, 0.325],
                        outline: false
                    });
                    if (target.getVariable(NotificationSystem._ameTextIdentifier) && !targetUserData.adminDuty) {
                        mp.game.graphics.drawText(target.getVariable(NotificationSystem._ameTextIdentifier), [x, y - (target.getVariable(NameTags.playerIsTypingState) ? 0.062 : 0.032)], {
                            font: 4,
                            color: [220, 125, 225, 255],
                            scale: [0.325, 0.325],
                            outline: false
                        });
                    }
                    if (target.getVariable(PlayerAuthentication._logoutIdentifier)) {
                        mp.game.graphics.drawText("~y~Logging out...~w~", [x, y - 0.042], {
                            font: 4,
                            color: [220, 125, 225, 255],
                            scale: [0.325, 0.325],
                            outline: false
                        });
                    }
                }
            }
        });
    }
    static getPlayerNick(player) {
        let pCharData = getTargetCharacterData(player);
        if (!pCharData)
            return '';
        let nick = player._nickName && pCharData?.characterClothing?.mask == 0
            ? player._nickName + ' [' + player.remoteId + ']'
            : 'Stranger ' + player.remoteId;
        return nick;
    }
}

class AdminFly {
    static LocalPlayer;
    static direction;
    static gameplayCam;
    static coords;
    static flightData;
    static updated;
    static gameControls;
    static flyEvent = "admin:fly";
    constructor() {
        AdminFly.LocalPlayer = mp.players.local;
        AdminFly.gameplayCam = mp.cameras.new('gameplay');
        let newFlight = {
            flying: false,
            f: 11.0,
            w: 1.0,
            h: 1.0,
            l: 1.0,
            point_distance: 1000
        };
        AdminFly.flightData = newFlight;
        mp.events.add("render", AdminFly.handleFlyOnRender);
        mp.events.add("admin:startFly", AdminFly.handleFlyStartup);
        mp.events.add("admin:endFly", AdminFly.handleFlyEnd);
        mp.keys.bind(_control_ids.F4, false, AdminFly.handleFlyClick);
    }
    static handleFlyClick() {
        if (!validateKeyPress())
            return;
        let userData = getUserData();
        if (!userData)
            return;
        if (userData?.adminDuty || userData.admin_status > AdminRanks.Admin_HeadAdmin) {
            mp.events.callRemote(AdminFly.flyEvent);
        }
    }
    static handleFlyStartup() {
        let localUserData = getUserData();
        if (!localUserData)
            return;
        if (localUserData?.admin_status > AdminRanks.Admin_SeniorSupport) {
            AdminFly.LocalPlayer.freezePosition(true);
            AdminFly.LocalPlayer.setInvincible(true);
        }
    }
    static handleFlyEnd() {
        AdminFly.LocalPlayer.setAlpha(255);
        AdminFly.LocalPlayer.freezePosition(false);
        AdminFly.LocalPlayer.setInvincible(false);
        mp.vehicles.forEach(veh => {
            veh.setNoCollision(AdminFly.LocalPlayer.handle, true);
        });
    }
    static handleFlyOnRender() {
        AdminFly.direction = AdminFly.gameplayCam.getDirection();
        AdminFly.coords = AdminFly.gameplayCam.getCoord();
        AdminFly.gameControls = mp.game.controls;
        let localUserData = getUserData();
        mp.players.forEach(player => {
            let userData = getTargetData(player);
            if (userData && userData.isFlying) {
                player.setAlpha(0);
            }
        });
        if (!localUserData)
            return;
        if (localUserData.adminDuty || localUserData.isFlying) {
            mp.game.invoke(_SET_FORCE_PED_FOOTSTEPS_TRACKS, false);
            mp.game.invoke(SET_PARTICLE_FX_, 'ped_foot_water');
            AdminFly.LocalPlayer.setCanRagdoll(false);
            AdminFly.LocalPlayer.setInvincible(true);
        }
        else {
            AdminFly.LocalPlayer.setCanRagdoll(true);
            AdminFly.LocalPlayer.setInvincible(false);
        }
        if (localUserData.isFlying) {
            let updated = false;
            AdminFly.LocalPlayer.setAlpha(0);
            mp.vehicles.forEach(veh => {
                veh.setNoCollision(mp.players.local.handle, false);
            });
            const position = AdminFly.LocalPlayer.position;
            if (AdminFly.gameControls.isControlPressed(0, _control_ids.W)) {
                if (AdminFly.flightData.f < 8.0) {
                    AdminFly.flightData.f *= 11.025;
                }
                position.x += AdminFly.direction.x / (AdminFly.flightData.f / 7);
                position.y += AdminFly.direction.y / (AdminFly.flightData.f / 7);
                position.z += AdminFly.direction.z / (AdminFly.flightData.f / 7);
                updated = true;
            }
            else if (AdminFly.gameControls.isControlPressed(0, _control_ids.S)) {
                if (AdminFly.flightData.f < 8.0) {
                    AdminFly.flightData.f *= 11.025;
                }
                position.x -= AdminFly.direction.x / (AdminFly.flightData.f / 8);
                position.y -= AdminFly.direction.y / (AdminFly.flightData.f / 8);
                position.z -= AdminFly.direction.z / (AdminFly.flightData.f / 8);
                updated = true;
            }
            else if (AdminFly.gameControls.isControlPressed(0, _control_ids.LCtrl)) {
                if (AdminFly.flightData.f < 8.0) {
                    AdminFly.flightData.f *= 11.025;
                }
                position.x += AdminFly.direction.x / (AdminFly.flightData.f / 60);
                position.y += AdminFly.direction.y / (AdminFly.flightData.f / 60);
                position.z += AdminFly.direction.z / (AdminFly.flightData.f / 60);
                updated = true;
            }
            else {
                AdminFly.flightData.f = 2.0;
            }
            if (AdminFly.gameControls.isControlPressed(0, _control_ids.A)) {
                if (AdminFly.flightData.l < 8.0) {
                    AdminFly.flightData.l *= 11.025;
                }
                position.x += (-AdminFly.direction.y) / (AdminFly.flightData.l / 7);
                position.y += AdminFly.direction.x / (AdminFly.flightData.l / 7);
                updated = true;
            }
            else if (AdminFly.gameControls.isControlPressed(0, _control_ids.D)) {
                if (AdminFly.flightData.l < 8.0) {
                    AdminFly.flightData.l *= 11.025;
                }
                position.x -= (-AdminFly.direction.y) / (AdminFly.flightData.l / 8);
                position.y -= AdminFly.direction.x / (AdminFly.flightData?.l / 8);
                updated = true;
            }
            else {
                AdminFly.flightData.l = 2.0;
            }
            if (AdminFly.gameControls.isControlPressed(0, _control_ids.E)) {
                if (AdminFly.flightData.h < 8.0) {
                    AdminFly.flightData.h *= 11.025;
                }
                position.z += (AdminFly.flightData.h / 55);
                updated = true;
            }
            else if (AdminFly.gameControls.isControlPressed(0, _control_ids.Q)) {
                if (AdminFly.flightData.h < 8.0) {
                    AdminFly.flightData.h *= 11.025;
                }
                position.z -= (AdminFly.flightData.h / 55);
                updated = true;
            }
            else {
                AdminFly.flightData.h = 2.0;
            }
            if (updated) {
                mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
            }
        }
    }
}

class AdminEvents {
    static LocalPlayer;
    constructor() {
        AdminEvents.LocalPlayer = mp.players.local;
        mp.events.add("admin:events:stopFly", AdminEvents.stopFly);
        mp.events.add("admin:events:teleportWay", AdminEvents.teleportWaypoint);
        mp.events.add("render", AdminEvents.handleRender);
    }
    static handleRender() {
        let UserData = getUserData();
        if (!UserData)
            return;
        if (UserData.isFrozen) {
            AdminEvents.LocalPlayer.freezePosition(true);
        }
    }
    static teleportWaypoint() {
        const waypoint = mp.game.ui.getFirstBlipInfoId(8);
        if (!mp.game.ui.doesBlipExist(waypoint))
            return NotificationSystem.createNotification("~r~You do not have a waypoint set.", false);
        const waypointPos = mp.game.ui.getBlipInfoIdCoord(waypoint);
        if (!waypointPos)
            return NotificationSystem.createNotification("~r~You cannot teleport to this area.", false);
        let zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, waypointPos.z, false, false);
        if (!zCoord) {
            for (let i = 1000; i >= 0; i -= 25) {
                mp.game.streaming.requestCollisionAtCoord(waypointPos.x, waypointPos.y, i);
                mp.game.wait(0);
            }
            zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, 1000, false, false);
            if (!zCoord)
                return NotificationSystem.createNotification("~r~You cannot teleport to this area.", false);
        }
        AdminEvents.LocalPlayer.position = new mp.Vector3(waypointPos.x, waypointPos.y, zCoord + 0.5);
        return NotificationSystem.createNotification("~r~Teleported to waypoint.", false);
    }
    static stopFly() {
        AdminEvents.LocalPlayer.freezePosition(false);
    }
}

class SwitchCamera {
    static LocalPlayer;
    constructor() {
        SwitchCamera.LocalPlayer = mp.players.local;
        mp.events.add("client:moveSkyCamera", SwitchCamera.moveCameraFromAir);
    }
    static async moveCameraFromAir(moveTo, switchType) {
        mp.gui.cursor.show(false, false);
        mp.game.cam.doScreenFadeOut(0);
        switch (moveTo) {
            case 'up':
                mp.game.invoke(_SWITCH_OUT_PLAYER_NATIVE, SwitchCamera.LocalPlayer.handle, 0, switchType);
                break;
            case 'down':
                SwitchCamera.checkCamInAir();
                mp.game.invoke(_SWITCH_IN_PLAYER_NATIVE, SwitchCamera.LocalPlayer.handle);
                break;
        }
        await mp.game.waitAsync(2500);
        mp.game.cam.doScreenFadeIn(500);
    }
    static async checkCamInAir() {
        if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
            GuiSystem.toggleHudComplete(false, false, false);
            await mp.game.waitAsync(40);
            SwitchCamera.checkCamInAir();
        }
        else {
            GuiSystem.toggleHudComplete(true, false, false);
        }
    }
}

const calcDist = (v1, v2) => {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
};

const getVehicleData = (vehicle) => {
    if (!vehicle || !mp.vehicles.exists(vehicle))
        return;
    let vehicleData = vehicle.getVariable(_SHARED_VEHICLE_DATA);
    return vehicleData;
};

const getClosestVehicleInRange = (range) => {
    if (mp.gui.cursor.visible)
        return;
    let closestVehicle = null;
    let closestDistance = range + 1;
    const position = mp.players.local.position;
    mp.vehicles.forEachInRange(position, range, (vehicle) => {
        const distToPlayer = calcDist(position, vehicle.position);
        if (distToPlayer < closestDistance) {
            closestVehicle = vehicle;
            closestDistance = distToPlayer;
        }
    });
    return closestVehicle;
};

class EnterVehicle {
    static LocalPlayer;
    constructor() {
        EnterVehicle.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.G, false, EnterVehicle.handleEnterPassenger);
    }
    static handleEnterPassenger() {
        if (mp.players.local.vehicle == null && mp.gui.cursor.visible == false) {
            const driverSeatId = -1;
            const playerPos = mp.players.local.position;
            const vehicle = getClosestVehicleInRange(6);
            if (!vehicle)
                return;
            let vehicleData = getVehicleData(vehicle);
            if (vehicle.isAVehicle() && vehicleData) {
                if (vehicleData.vehicle_locked) {
                    vehicle.setDoorsLockedForAllPlayers(true);
                    return;
                }
                if (mp.game.vehicle.isThisModelABike(vehicle.model)) {
                    if (vehicle.isSeatFree(0) && !mp.gui.cursor.visible) {
                        mp.players.local.taskEnterVehicle(vehicle.handle, 5000, 0, 2.0, 1, 0);
                    }
                    return;
                }
                const seatRear = vehicle.getBoneIndexByName('seat_r');
                const seatFrontPassenger = vehicle.getBoneIndexByName('seat_pside_f');
                const seatRearDriver = vehicle.getBoneIndexByName('seat_dside_r');
                const seatRearDriver1 = vehicle.getBoneIndexByName('seat_dside_r1');
                const seatRearDriver2 = vehicle.getBoneIndexByName('seat_dside_r2');
                const seatRearDriver3 = vehicle.getBoneIndexByName('seat_dside_r3');
                const seatRearDriver4 = vehicle.getBoneIndexByName('seat_dside_r4');
                const seatRearDriver5 = vehicle.getBoneIndexByName('seat_dside_r5');
                const seatRearDriver6 = vehicle.getBoneIndexByName('seat_dside_r6');
                const seatRearDriver7 = vehicle.getBoneIndexByName('seat_dside_r7');
                const seatRearPassenger = vehicle.getBoneIndexByName('seat_pside_r');
                const seatRearPassenger1 = vehicle.getBoneIndexByName('seat_pside_r1');
                const seatRearPassenger2 = vehicle.getBoneIndexByName('seat_pside_r2');
                const seatRearPassenger3 = vehicle.getBoneIndexByName('seat_pside_r3');
                const seatRearPassenger4 = vehicle.getBoneIndexByName('seat_pside_r4');
                const seatRearPassenger5 = vehicle.getBoneIndexByName('seat_pside_r5');
                const seatRearPassenger6 = vehicle.getBoneIndexByName('seat_pside_r6');
                const seatRearPassenger7 = vehicle.getBoneIndexByName('seat_pside_r7');
                const seatRearPosition = seatRear === -1 ? null : vehicle.getWorldPositionOfBone(seatRear);
                const seatFrontPassengerPosition = seatFrontPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatFrontPassenger);
                const seatRearDriverPosition = seatRearDriver === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver);
                const seatRearDriver1Position = seatRearDriver1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver1);
                const seatRearDriver2Position = seatRearDriver2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver2);
                const seatRearDriver3Position = seatRearDriver3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver3);
                const seatRearDriver4Position = seatRearDriver4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver4);
                const seatRearDriver5Position = seatRearDriver5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver5);
                const seatRearDriver6Position = seatRearDriver6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver6);
                const seatRearDriver7Position = seatRearDriver7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver7);
                const seatRearPassengerPosition = seatRearPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger);
                const seatRearPassenger1Position = seatRearPassenger1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger1);
                const seatRearPassenger2Position = seatRearPassenger2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger2);
                const seatRearPassenger3Position = seatRearPassenger3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger3);
                const seatRearPassenger4Position = seatRearPassenger4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger4);
                const seatRearPassenger5Position = seatRearPassenger5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger5);
                const seatRearPassenger6Position = seatRearPassenger6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger6);
                const seatRearPassenger7Position = seatRearPassenger7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger7);
                let closestFreeSeatNumber = -1;
                let seatIndex = driverSeatId;
                let closestSeatDistance = Number.MAX_SAFE_INTEGER;
                let calculatedDistance = null;
                calculatedDistance = seatRearPosition === null ? null : calcDist(playerPos, seatRearPosition);
                seatIndex = seatRear === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatFrontPassengerPosition === null ? null : calcDist(playerPos, seatFrontPassengerPosition);
                seatIndex = seatFrontPassenger === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriverPosition === null ? null : calcDist(playerPos, seatRearDriverPosition);
                seatIndex = seatRearDriver === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassengerPosition === null ? null : calcDist(playerPos, seatRearPassengerPosition);
                seatIndex = seatRearPassenger === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriver1Position === null ? null : calcDist(playerPos, seatRearDriver1Position);
                seatIndex = seatRearDriver1 === -1 ? seatIndex : seatIndex + 1; // 3
                if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
                    if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                        closestSeatDistance = calculatedDistance;
                        closestFreeSeatNumber = seatIndex;
                    }
                }
                calculatedDistance = seatRearPassenger1Position === null ? null : calcDist(playerPos, seatRearPassenger1Position);
                seatIndex = seatRearPassenger1 === -1 ? seatIndex : seatIndex + 1; // 4
                if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
                    if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                        closestSeatDistance = calculatedDistance;
                        closestFreeSeatNumber = seatIndex;
                    }
                }
                calculatedDistance = seatRearDriver2Position === null ? null : calcDist(playerPos, seatRearDriver2Position);
                seatIndex = seatRearDriver2 === -1 ? seatIndex : seatIndex + 1; // 5
                if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
                    if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                        closestSeatDistance = calculatedDistance;
                        closestFreeSeatNumber = seatIndex;
                    }
                }
                calculatedDistance = seatRearPassenger2Position === null ? null : calcDist(playerPos, seatRearPassenger2Position);
                seatIndex = seatRearPassenger2 === -1 ? seatIndex : seatIndex + 1; // 6
                if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
                    if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                        closestSeatDistance = calculatedDistance;
                        closestFreeSeatNumber = seatIndex;
                    }
                }
                calculatedDistance = seatRearDriver3Position === null ? null : calcDist(playerPos, seatRearDriver3Position);
                seatIndex = seatRearDriver3 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassenger3Position === null ? null : calcDist(playerPos, seatRearPassenger3Position);
                seatIndex = seatRearPassenger3 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriver4Position === null ? null : calcDist(playerPos, seatRearDriver4Position);
                seatIndex = seatRearDriver4 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassenger4Position === null ? null : calcDist(playerPos, seatRearPassenger4Position);
                seatIndex = seatRearPassenger4 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriver5Position === null ? null : calcDist(playerPos, seatRearDriver5Position);
                seatIndex = seatRearDriver5 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassenger5Position === null ? null : calcDist(playerPos, seatRearPassenger5Position);
                seatIndex = seatRearPassenger5 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriver6Position === null ? null : calcDist(playerPos, seatRearDriver6Position);
                seatIndex = seatRearDriver6 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassenger6Position === null ? null : calcDist(playerPos, seatRearPassenger6Position);
                seatIndex = seatRearPassenger6 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearDriver7Position === null ? null : calcDist(playerPos, seatRearDriver7Position);
                seatIndex = seatRearDriver7 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                calculatedDistance = seatRearPassenger7Position === null ? null : calcDist(playerPos, seatRearPassenger7Position);
                seatIndex = seatRearPassenger7 === -1 ? seatIndex : seatIndex + 1;
                if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
                    closestSeatDistance = calculatedDistance;
                    closestFreeSeatNumber = seatIndex;
                }
                if (closestFreeSeatNumber === -1) {
                    return;
                }
                const lastAnimatableSeatOverrides = {
                    [mp.game.joaat('journey')]: driverSeatId + 1,
                    [mp.game.joaat('journey2')]: driverSeatId + 1
                };
                let lastAnimatableSeatIndex = driverSeatId + 3;
                if (lastAnimatableSeatOverrides[vehicle.model] !== undefined) {
                    lastAnimatableSeatIndex = lastAnimatableSeatOverrides[vehicle.model];
                }
                if (closestFreeSeatNumber <= lastAnimatableSeatIndex) {
                    mp.players.local.taskEnterVehicle(vehicle.handle, 5000, closestFreeSeatNumber, 2.0, 1, 0);
                }
                else {
                    mp.game.invoke(TASK_WARP_PED_INTO_VEHICLE, mp.players.local.handle, vehicle.handle, closestFreeSeatNumber);
                }
            }
        }
    }
}

class VehicleLocking {
    static LocalPlayer;
    static _lockVehicleRange = 5;
    static _lockVehicleEvent = "vehicle:toggleLock";
    constructor() {
        VehicleLocking.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.K, false, VehicleLocking.toggleVehicleLock);
    }
    static toggleVehicleLock() {
        if (!validateKeyPress())
            return;
        let lockVehicle = getClosestVehicleInRange(VehicleLocking._lockVehicleRange);
        if (!lockVehicle)
            return;
        mp.events.callRemote(VehicleLocking._lockVehicleEvent, lockVehicle);
    }
}

class VehicleInteraction {
    static LocalPlayer;
    static bones = ['door_dside_f', 'door_pside_f', 'door_dside_r', 'door_pside_r', 'bonnet', 'boot'];
    static names = ['door', 'door', 'door', 'door', 'hood', 'trunk', 'trunk'];
    static boneTarget;
    constructor() {
        VehicleInteraction.LocalPlayer = mp.players.local;
        mp.events.add('render', VehicleInteraction.handleInteractionRender);
        mp.keys.bind(_control_ids.EBIND, false, VehicleInteraction.handleInteraction);
        mp.events.add('playerLeaveVehicle', VehicleInteraction.syncOnExit);
    }
    static syncOnExit(vehicle, seat) {
        mp.events.callRemote('server:handleDoorInteraction', vehicle, seat + 1);
    }
    static handleInteractionRender() {
        VehicleInteraction.syncVehicleDoors();
        VehicleInteraction.LocalPlayer.setConfigFlag(_config_flags.PED_FLAG_STOP_ENGINE_TURNING, true);
        if (VehicleInteraction.checkInteractionRender()) {
            const raycast = VehicleInteraction.getLocalTargetVehicle();
            if (raycast == null || raycast.entity.type != 'vehicle')
                return;
            VehicleInteraction.boneTarget = VehicleInteraction.getClosestBone(raycast);
            if (VehicleInteraction.boneTarget) {
                const bonePos = raycast.entity.getWorldPositionOfBone(VehicleInteraction.boneTarget.boneIndex);
                const vehicleData = getVehicleData(raycast.entity);
                if (!vehicleData)
                    return;
                if (vehicleData.vehicle_locked) {
                    return;
                }
                let renderText = '~g~[E]~w~' +
                    ` ${VehicleInteraction.boneTarget.locked
                        ? `Close ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`
                        : `Open ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`}`;
                let dist = distBetweenCoords(VehicleInteraction.LocalPlayer.position, bonePos);
                mp.game.graphics.drawText(renderText, [bonePos.x, bonePos.y, bonePos.z], {
                    scale: [0.3, 0.3],
                    outline: false,
                    color: [255, 255, 255, 255 - dist * 80],
                    font: 4
                });
            }
        }
    }
    static syncVehicleDoors() {
        mp.vehicles.forEachInStreamRange((vehicle) => {
            let vehicleData = getVehicleData(vehicle);
            if (!vehicleData)
                return;
            vehicleData.vehicle_doors.forEach((state, index) => {
                if (state)
                    vehicle.setDoorOpen(index, false, true);
                else
                    vehicle.setDoorShut(index, true);
            });
        });
    }
    static handleInteraction() {
        if (!mp.gui.cursor.visible &&
            !VehicleInteraction.LocalPlayer.isTypingInTextChat &&
            VehicleInteraction.boneTarget &&
            VehicleInteraction.boneTarget.pushTime + 1 >= Date.now() / 1000) {
            VehicleInteraction.interactionHandler();
        }
    }
    static interactionHandler() {
        let vehicleData = getVehicleData(VehicleInteraction.boneTarget.veh);
        if (!vehicleData || vehicleData?.vehicle_locked)
            return;
        mp.events.callRemote('server:handleDoorInteraction', VehicleInteraction.boneTarget.veh, VehicleInteraction.boneTarget.id);
    }
    static getClosestBone(raycast) {
        let data = [];
        VehicleInteraction.bones.forEach((bone, index) => {
            const rayEntity = raycast.entity;
            if (!rayEntity || rayEntity.type != 'vehicle')
                return;
            const boneIndex = rayEntity.getBoneIndexByName(bone);
            const bonePos = rayEntity.getWorldPositionOfBone(boneIndex);
            if (bonePos) {
                let vehicleData = getVehicleData(raycast.entity);
                if (!vehicleData || !vehicleData.vehicle_doors)
                    return;
                data.push({
                    id: index,
                    boneIndex: boneIndex,
                    name: bone,
                    locked: !vehicleData.vehicle_doors[index] || (!vehicleData.vehicle_doors[index] && !raycast.entity.isDoorFullyOpen(index))
                        ? false
                        : true,
                    bonePos: bonePos,
                    raycast: raycast,
                    veh: raycast.entity,
                    distance: mp.game.gameplay.getDistanceBetweenCoords(bonePos.x, bonePos.y, bonePos.z, raycast.position.x, raycast.position.y, raycast.position.z, false),
                    pushTime: Date.now() / 1000
                });
            }
        });
        return data.sort((a, b) => a.distance - b.distance)[0];
    }
    static getLocalTargetVehicle(range = 1.5) {
        let startPosition = mp.players.local.getBoneCoords(12844, 0.5, 0, 0);
        const res = mp.game.graphics.getScreenActiveResolution(1, 1);
        const coord = new mp.Vector3(res.x / 2, res.y / 2, 2 | 4 | 8);
        const secondPoint = mp.game.graphics.screen2dToWorld3d(coord);
        if (!secondPoint)
            return null;
        startPosition.z -= 0.3;
        const target = mp.raycasting.testPointToPoint(startPosition, secondPoint, mp.players.local, 2 | 4 | 8 | 16);
        if (target &&
            mp.game.gameplay.getDistanceBetweenCoords(target.position.x, target.position.y, target.position.z, VehicleInteraction.LocalPlayer.position.x, VehicleInteraction.LocalPlayer.position.y, VehicleInteraction.LocalPlayer.position.z, false) < range)
            return target;
        return null;
    }
    static checkInteractionRender() {
        if (!VehicleInteraction.LocalPlayer.vehicle && !mp.gui.cursor.visible && VehicleInteraction.LocalPlayer.getVehicleIsTryingToEnter() == 0) {
            return true;
        }
        return false;
    }
    static drawTarget3d(pos, textureDict = 'mpmissmarkers256', textureName = 'corona_shade', scaleX = 0.005, scaleY = 0.01) {
        const position = mp.game.graphics.world3dToScreen2d(pos);
        if (!position)
            return;
        mp.game.graphics.drawSprite(textureDict, textureName, position.x, position.y, scaleX, scaleY, 0, 0, 0, 0, 200, false);
    }
}

class VehicleWindows {
    static LocalPlayer = mp.players.local;
    constructor() {
        mp.events.add("entityStreamIn", VehicleWindows.handleStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleWindows.handleDataHandler);
    }
    static handleDataHandler(entity, data) {
        if (entity.type === "vehicle" && data !== undefined) {
            let vehicleData = getVehicleData(entity);
            if (!vehicleData || !vehicleData.vehicle_windows)
                return;
            VehicleWindows.syncWindowState(entity, vehicleData);
        }
    }
    static handleStreamIn(entity) {
        if (entity.type === "vehicle") {
            let vehicleData = getVehicleData(entity);
            if (!vehicleData || !vehicleData.vehicle_windows)
                return;
            VehicleWindows.syncWindowState(entity, vehicleData);
        }
    }
    static syncWindowState(entity, vehicleData) {
        vehicleData.vehicle_windows.forEach((state, index) => {
            if (state)
                entity.rollDownWindow(index);
            else if (!state) {
                if (entity.isWindowIntact(index)) {
                    entity.fixWindow(index);
                }
                entity.rollUpWindow(index);
            }
        });
    }
}

class HandsUp {
    static LocalPlayer;
    static hasHandsUp;
    static syncEvent = "server:anim:startHandsUp";
    static _handsUpAnimIdentifer = "anim:hasHandsUp";
    constructor() {
        HandsUp.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.X, false, HandsUp.startAnim);
        mp.events.add("entityStreamIn", HandsUp.handleStreamIn);
        mp.events.add("playerEnterVehicle", HandsUp.handleVehEnter);
        mp.events.add("render", HandsUp.handleRender);
        mp.events.addDataHandler(HandsUp._handsUpAnimIdentifer, HandsUp.handleDataHandler);
    }
    static handleVehEnter() {
        if (HandsUp.hasHandsUp) {
            HandsUp.hasHandsUp = false;
            mp.events.callRemote(HandsUp.syncEvent, false);
        }
    }
    static handleRender() {
        if (HandsUp.LocalPlayer.getVariable(HandsUp._handsUpAnimIdentifer)) {
            WeaponSystem.disableGunShooting();
            if (HandsUp.LocalPlayer.vehicle && HandsUp.LocalPlayer.vehicle.getPedInSeat(-1) == HandsUp.LocalPlayer.handle) {
                HandsUp.LocalPlayer.vehicle.setUndriveable(true);
                VehicleSystems.disableControls();
            }
        }
    }
    static handleStreamIn(entity) {
        if (entity.type == "player" && entity.getVariable(HandsUp._handsUpAnimIdentifer)) {
            HandsUp.playAnimForPlayer(entity);
        }
    }
    static handleDataHandler(entity) {
        if (entity.type == "player") {
            if (entity.getVariable(HandsUp._handsUpAnimIdentifer)) {
                HandsUp.playAnimForPlayer(entity);
            }
            else {
                entity.clearTasks();
            }
        }
    }
    static async playAnimForPlayer(player) {
        for (let i = 0; player.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        mp.game.streaming.requestAnimDict(`random@mugging3`);
        player.taskPlayAnim(`random@mugging3`, `handsup_standing_base`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false);
    }
    static startAnim() {
        if (validateKeyPress(true, true, true) && HandsUp.LocalPlayer.browserRouter == "/") {
            if (HandsUp.LocalPlayer._fuelNozzleObject) {
                NotificationSystem.createNotification("~r~You can't do this whilst refuelling", false);
                return;
            }
            HandsUp.hasHandsUp = !HandsUp.hasHandsUp;
            mp.events.callRemote(HandsUp.syncEvent, HandsUp.hasHandsUp);
        }
    }
}

class VehicleEngine {
    static LocalPlayer;
    static engineToggleEvent = "server:toggleEngine";
    constructor() {
        VehicleEngine.LocalPlayer = mp.players.local;
        mp.events.add("playerReady", VehicleEngine.handleStartUp);
        mp.events.add("playerEnterVehicle", VehicleEngine.handleEnter);
        mp.events.add("entityStreamIn", VehicleEngine.handleStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleEngine.handleDataHandler);
        mp.keys.bind(_control_ids.Y, false, VehicleEngine.toggleEngine);
    }
    static handleStartUp() {
        mp.game.vehicle.defaultEngineBehaviour = false;
    }
    static async handleStreamIn(entity) {
        let vehicleData = getVehicleData(entity);
        if (entity.type == "vehicle" && vehicleData && vehicleData.engine_status && vehicleData.vehicle_fuel > 0) {
            for (let i = 0; entity.handle === 0 && i < 15; ++i) {
                await mp.game.waitAsync(100);
            }
            entity.setEngineOn(true, true, true);
        }
    }
    static handleEnter(entity) {
        if (getVehicleData(entity)?.engine_status) {
            entity.setEngineOn(true, true, true);
        }
    }
    static handleDataHandler(entity, vehicleData) {
        if (entity.type != "vehicle" || !vehicleData)
            return;
        if (mp.players.atHandle(entity.getPedInSeat(-1)) && mp.players.atHandle(entity.getPedInSeat(-1)).getVariable(HandsUp._handsUpAnimIdentifer))
            return;
        if (vehicleData.engine_status && vehicleData.vehicle_fuel > 0 && vehicleData.vehicle_health > 0) {
            entity.setEngineOn(true, true, true);
        }
        else {
            entity.setEngineOn(false, true, true);
            entity.setUndriveable(true);
        }
    }
    static toggleEngine() {
        if (VehicleEngine.LocalPlayer.vehicle && !VehicleEngine.LocalPlayer.isTypingInTextChat && VehicleEngine.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleEngine.LocalPlayer.handle && VehicleEngine.LocalPlayer.browserRouter != Browsers.ModsView) {
            let vehicleData = getVehicleData(VehicleEngine.LocalPlayer.vehicle);
            if (!vehicleData)
                return;
            if (vehicleData.vehicle_fuel <= 0 || vehicleData.vehicle_health <= 0) {
                NotificationSystem.createNotification("~r~Engine fails to start.", false);
                return;
            }
            mp.events.callRemote(VehicleEngine.engineToggleEvent, vehicleData.vehicle_display_name);
        }
    }
}

class VehicleIndicators {
    static eventName = "server:toggleIndication";
    static LocalPlayer;
    constructor() {
        VehicleIndicators.LocalPlayer = mp.players.local;
        mp.events.add("entityStreamIn", VehicleIndicators.handleVehicleStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleIndicators.handleDataHandler);
        mp.keys.bind(_control_ids.LEFTARR, false, () => validateKeyPress() && VehicleIndicators.handleVehicleIndicator(1));
        mp.keys.bind(_control_ids.RIGHTARR, false, () => validateKeyPress() && VehicleIndicators.handleVehicleIndicator(0));
    }
    static handleVehicleStreamIn(entity) {
        if (entity.type != "vehicle")
            return;
        let vehicleData = getVehicleData(entity);
        if (!vehicleData)
            return;
        VehicleIndicators.setIndicationForVeh(entity, vehicleData.indicator_status);
    }
    static handleDataHandler(entity, data) {
        if (entity.type != "vehicle" || !data)
            return;
        VehicleIndicators.setIndicationForVeh(entity, data.indicator_status);
    }
    static handleVehicleIndicator(indicateId) {
        if (VehicleIndicators.LocalPlayer.vehicle && !VehicleIndicators.LocalPlayer.isTypingInTextChat) {
            let vehicleData = getVehicleData(VehicleIndicators.LocalPlayer.vehicle);
            if (!vehicleData)
                return;
            if (vehicleData.indicator_status == indicateId) {
                indicateId = -1;
            }
            mp.events.callRemote(VehicleIndicators.eventName, indicateId);
        }
    }
    static setIndicationForVeh(entity, indicatorStatus) {
        entity.setIndicatorLights(0, false);
        entity.setIndicatorLights(1, false);
        if (indicatorStatus != -1 && typeof indicatorStatus == "number") {
            entity.setIndicatorLights(indicatorStatus, true);
        }
    }
}

class VehicleSiren {
    static LocalPlayer;
    static eventName = "server:toggleSiren";
    static _emergencyClass = 18;
    constructor() {
        VehicleSiren.LocalPlayer = mp.players.local;
        mp.events.add("render", VehicleSiren.handleRender);
        mp.events.add("entityStreamIn", VehicleSiren.handleEntityStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleSiren.handleDataHandler);
        mp.keys.bind(_control_ids.QBIND, false, VehicleSiren.toggleVehicleSiren);
    }
    static handleRender() {
        mp.vehicles.forEachInStreamRange((veh) => {
            let vehicleData = getVehicleData(veh);
            if (!vehicleData)
                return;
            if (!vehicleData.vehicle_siren) {
                veh.setSirenSound(false);
            }
        });
    }
    static handleEntityStreamIn(entity) {
        if (entity.type != "vehicle")
            return;
        let vehicleData = getVehicleData(entity);
        if (!vehicleData)
            return;
        entity.setSirenSound(vehicleData.vehicle_siren ? true : false);
    }
    static handleDataHandler(entity, data) {
        if (entity.type != "vehicle" || !data)
            return;
        entity.setSirenSound(data.vehicle_siren ? true : false);
    }
    static toggleVehicleSiren() {
        if (!validateKeyPress() || !VehicleSiren.LocalPlayer.vehicle)
            return;
        if (VehicleSiren.LocalPlayer.vehicle.getClass() == VehicleSiren._emergencyClass) {
            let localPlayerVehicleData = getVehicleData(VehicleSiren.LocalPlayer.vehicle);
            if (!localPlayerVehicleData)
                return;
            mp.events.callRemote(VehicleSiren.eventName);
        }
    }
}

const mpsmuggler_overlays = [
    {
        "Name": "TAT_SM_000",
        "LocalizedName": "Bless The Dead",
        "HashNameMale": "MP_Smuggler_Tattoo_000_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_000_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 11270
    },
    {
        "Name": "TAT_SM_001",
        "LocalizedName": "Crackshot",
        "HashNameMale": "MP_Smuggler_Tattoo_001_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_001_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 10825
    },
    {
        "Name": "TAT_SM_002",
        "LocalizedName": "Dead Lies",
        "HashNameMale": "MP_Smuggler_Tattoo_002_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_002_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 12430
    },
    {
        "Name": "TAT_SM_003",
        "LocalizedName": "Give Nothing Back",
        "HashNameMale": "MP_Smuggler_Tattoo_003_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_003_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 13090
    },
    {
        "Name": "TAT_SM_004",
        "LocalizedName": "Honor",
        "HashNameMale": "MP_Smuggler_Tattoo_004_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_004_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 8150
    },
    {
        "Name": "TAT_SM_005",
        "LocalizedName": "Mutiny",
        "HashNameMale": "MP_Smuggler_Tattoo_005_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_005_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 7920
    },
    {
        "Name": "TAT_SM_006",
        "LocalizedName": "Never Surrender",
        "HashNameMale": "MP_Smuggler_Tattoo_006_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_006_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 9475
    },
    {
        "Name": "TAT_SM_007",
        "LocalizedName": "No Honor",
        "HashNameMale": "MP_Smuggler_Tattoo_007_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_007_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 8525
    },
    {
        "Name": "TAT_SM_008",
        "LocalizedName": "Horrors Of The Deep",
        "HashNameMale": "MP_Smuggler_Tattoo_008_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_008_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 11045
    },
    {
        "Name": "TAT_SM_009",
        "LocalizedName": "Tall Ship Conflict",
        "HashNameMale": "MP_Smuggler_Tattoo_009_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_009_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 16625
    },
    {
        "Name": "TAT_SM_010",
        "LocalizedName": "See You In Hell",
        "HashNameMale": "MP_Smuggler_Tattoo_010_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_010_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 12815
    },
    {
        "Name": "TAT_SM_011",
        "LocalizedName": "Sinner",
        "HashNameMale": "MP_Smuggler_Tattoo_011_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_011_F",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 8110
    },
    {
        "Name": "TAT_SM_012",
        "LocalizedName": "Thief",
        "HashNameMale": "MP_Smuggler_Tattoo_012_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_012_F",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 10720
    },
    {
        "Name": "TAT_SM_013",
        "LocalizedName": "Torn Wings",
        "HashNameMale": "MP_Smuggler_Tattoo_013_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_013_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 10540
    },
    {
        "Name": "TAT_SM_014",
        "LocalizedName": "Mermaid's Curse",
        "HashNameMale": "MP_Smuggler_Tattoo_014_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_014_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 8825
    },
    {
        "Name": "TAT_SM_015",
        "LocalizedName": "Jolly Roger",
        "HashNameMale": "MP_Smuggler_Tattoo_015_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_015_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 9765
    },
    {
        "Name": "TAT_SM_016",
        "LocalizedName": "Skull Compass",
        "HashNameMale": "MP_Smuggler_Tattoo_016_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_016_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 13790
    },
    {
        "Name": "TAT_SM_017",
        "LocalizedName": "Framed Tall Ship",
        "HashNameMale": "MP_Smuggler_Tattoo_017_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_017_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 18850
    },
    {
        "Name": "TAT_SM_018",
        "LocalizedName": "Finders Keepers",
        "HashNameMale": "MP_Smuggler_Tattoo_018_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_018_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 16990
    },
    {
        "Name": "TAT_SM_019",
        "LocalizedName": "Lost At Sea",
        "HashNameMale": "MP_Smuggler_Tattoo_019_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_019_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 11105
    },
    {
        "Name": "TAT_SM_020",
        "LocalizedName": "Homeward Bound",
        "HashNameMale": "MP_Smuggler_Tattoo_020_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_020_F",
        "Zone": "ZONE_RIGHT_LEG",
        "ZoneID": 5,
        "Price": 9155
    },
    {
        "Name": "TAT_SM_021",
        "LocalizedName": "Dead Tales",
        "HashNameMale": "MP_Smuggler_Tattoo_021_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_021_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 14860
    },
    {
        "Name": "TAT_SM_022",
        "LocalizedName": "X Marks The Spot",
        "HashNameMale": "MP_Smuggler_Tattoo_022_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_022_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 16710
    },
    {
        "Name": "TAT_SM_023",
        "LocalizedName": "Stylized Kraken",
        "HashNameMale": "MP_Smuggler_Tattoo_023_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_023_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 14400
    },
    {
        "Name": "TAT_SM_024",
        "LocalizedName": "Pirate Captain",
        "HashNameMale": "MP_Smuggler_Tattoo_024_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_024_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 18210
    },
    {
        "Name": "TAT_SM_025",
        "LocalizedName": "Claimed By The Beast",
        "HashNameMale": "MP_Smuggler_Tattoo_025_M",
        "HashNameFemale": "MP_Smuggler_Tattoo_025_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 17450
    }
];

const mpvinewood_overlays = [
    {
        "Name": "TAT_VW_000",
        "LocalizedName": "In the Pocket",
        "HashNameMale": "MP_Vinewood_Tat_000_M",
        "HashNameFemale": "MP_Vinewood_Tat_000_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 21115
    },
    {
        "Name": "TAT_VW_001",
        "LocalizedName": "Jackpot",
        "HashNameMale": "MP_Vinewood_Tat_001_M",
        "HashNameFemale": "MP_Vinewood_Tat_001_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 20475
    },
    {
        "Name": "TAT_VW_002",
        "LocalizedName": "Suits",
        "HashNameMale": "MP_Vinewood_Tat_002_M",
        "HashNameFemale": "MP_Vinewood_Tat_002_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 19745
    },
    {
        "Name": "TAT_VW_003",
        "LocalizedName": "Royal Flush",
        "HashNameMale": "MP_Vinewood_Tat_003_M",
        "HashNameFemale": "MP_Vinewood_Tat_003_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 18865
    },
    {
        "Name": "TAT_VW_004",
        "LocalizedName": "Lady Luck",
        "HashNameMale": "MP_Vinewood_Tat_004_M",
        "HashNameFemale": "MP_Vinewood_Tat_004_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 19505
    },
    {
        "Name": "TAT_VW_005",
        "LocalizedName": "Get Lucky",
        "HashNameMale": "MP_Vinewood_Tat_005_M",
        "HashNameFemale": "MP_Vinewood_Tat_005_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 16680
    },
    {
        "Name": "TAT_VW_006",
        "LocalizedName": "Wheel of Suits",
        "HashNameMale": "MP_Vinewood_Tat_006_M",
        "HashNameFemale": "MP_Vinewood_Tat_006_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 31100
    },
    {
        "Name": "TAT_VW_007",
        "LocalizedName": "777",
        "HashNameMale": "MP_Vinewood_Tat_007_M",
        "HashNameFemale": "MP_Vinewood_Tat_007_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 13460
    },
    {
        "Name": "TAT_VW_008",
        "LocalizedName": "Snake Eyes",
        "HashNameMale": "MP_Vinewood_Tat_008_M",
        "HashNameFemale": "MP_Vinewood_Tat_008_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 31520
    },
    {
        "Name": "TAT_VW_009",
        "LocalizedName": "Till Death Do Us Part",
        "HashNameMale": "MP_Vinewood_Tat_009_M",
        "HashNameFemale": "MP_Vinewood_Tat_009_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 28970
    },
    {
        "Name": "TAT_VW_010",
        "LocalizedName": "Photo Finish",
        "HashNameMale": "MP_Vinewood_Tat_010_M",
        "HashNameFemale": "MP_Vinewood_Tat_010_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 27860
    },
    {
        "Name": "TAT_VW_011",
        "LocalizedName": "Life's a Gamble",
        "HashNameMale": "MP_Vinewood_Tat_011_M",
        "HashNameFemale": "MP_Vinewood_Tat_011_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 29825
    },
    {
        "Name": "TAT_VW_012",
        "LocalizedName": "Skull of Suits",
        "HashNameMale": "MP_Vinewood_Tat_012_M",
        "HashNameFemale": "MP_Vinewood_Tat_012_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 32115
    },
    {
        "Name": "TAT_VW_013",
        "LocalizedName": "One-armed Bandit",
        "HashNameMale": "MP_Vinewood_Tat_013_M",
        "HashNameFemale": "MP_Vinewood_Tat_013_F",
        "Zone": "ZONE_LEFT_LEG",
        "ZoneID": 4,
        "Price": 11505
    },
    {
        "Name": "TAT_VW_014",
        "LocalizedName": "Vice",
        "HashNameMale": "MP_Vinewood_Tat_014_M",
        "HashNameFemale": "MP_Vinewood_Tat_014_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 19215
    },
    {
        "Name": "TAT_VW_015",
        "LocalizedName": "The Jolly Joker",
        "HashNameMale": "MP_Vinewood_Tat_015_M",
        "HashNameFemale": "MP_Vinewood_Tat_015_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 30840
    },
    {
        "Name": "TAT_VW_016",
        "LocalizedName": "Rose & Aces",
        "HashNameMale": "MP_Vinewood_Tat_016_M",
        "HashNameFemale": "MP_Vinewood_Tat_016_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 24425
    },
    {
        "Name": "TAT_VW_017",
        "LocalizedName": "Roll the Dice",
        "HashNameMale": "MP_Vinewood_Tat_017_M",
        "HashNameFemale": "MP_Vinewood_Tat_017_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 33765
    },
    {
        "Name": "TAT_VW_018",
        "LocalizedName": "The Gambler's Life",
        "HashNameMale": "MP_Vinewood_Tat_018_M",
        "HashNameFemale": "MP_Vinewood_Tat_018_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 21095
    },
    {
        "Name": "TAT_VW_019",
        "LocalizedName": "Can't Win Them All",
        "HashNameMale": "MP_Vinewood_Tat_019_M",
        "HashNameFemale": "MP_Vinewood_Tat_019_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 15665
    },
    {
        "Name": "TAT_VW_020",
        "LocalizedName": "Cash is King",
        "HashNameMale": "MP_Vinewood_Tat_020_M",
        "HashNameFemale": "MP_Vinewood_Tat_020_F",
        "Zone": "ZONE_RIGHT_LEG",
        "ZoneID": 5,
        "Price": 14805
    },
    {
        "Name": "TAT_VW_021",
        "LocalizedName": "Show Your Hand",
        "HashNameMale": "MP_Vinewood_Tat_021_M",
        "HashNameFemale": "MP_Vinewood_Tat_021_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 40250
    },
    {
        "Name": "TAT_VW_022",
        "LocalizedName": "Blood Money",
        "HashNameMale": "MP_Vinewood_Tat_022_M",
        "HashNameFemale": "MP_Vinewood_Tat_022_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 12100
    },
    {
        "Name": "TAT_VW_023",
        "LocalizedName": "Lucky 7s",
        "HashNameMale": "MP_Vinewood_Tat_023_M",
        "HashNameFemale": "MP_Vinewood_Tat_023_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 0
    },
    {
        "Name": "TAT_VW_024",
        "LocalizedName": "Cash Mouth",
        "HashNameMale": "MP_Vinewood_Tat_024_M",
        "HashNameFemale": "MP_Vinewood_Tat_024_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 19990
    },
    {
        "Name": "TAT_VW_025",
        "LocalizedName": "Queen of Roses",
        "HashNameMale": "MP_Vinewood_Tat_025_M",
        "HashNameFemale": "MP_Vinewood_Tat_025_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 20110
    },
    {
        "Name": "TAT_VW_026",
        "LocalizedName": "Banknote Rose",
        "HashNameMale": "MP_Vinewood_Tat_026_M",
        "HashNameFemale": "MP_Vinewood_Tat_026_F",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 25305
    },
    {
        "Name": "TAT_VW_027",
        "LocalizedName": "8-Ball Rose",
        "HashNameMale": "MP_Vinewood_Tat_027_M",
        "HashNameFemale": "MP_Vinewood_Tat_027_F",
        "Zone": "ZONE_LEFT_LEG",
        "ZoneID": 4,
        "Price": 24550
    },
    {
        "Name": "TAT_VW_028",
        "LocalizedName": "Skull & Aces",
        "HashNameMale": "MP_Vinewood_Tat_028_M",
        "HashNameFemale": "MP_Vinewood_Tat_028_F",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 18850
    },
    {
        "Name": "TAT_VW_029",
        "LocalizedName": "The Table",
        "HashNameMale": "MP_Vinewood_Tat_029_M",
        "HashNameFemale": "MP_Vinewood_Tat_029_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 36650
    },
    {
        "Name": "TAT_VW_030",
        "LocalizedName": "The Royals",
        "HashNameMale": "MP_Vinewood_Tat_030_M",
        "HashNameFemale": "MP_Vinewood_Tat_030_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 0
    },
    {
        "Name": "TAT_VW_031",
        "LocalizedName": "Gambling Royalty",
        "HashNameMale": "MP_Vinewood_Tat_031_M",
        "HashNameFemale": "MP_Vinewood_Tat_031_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 30220
    },
    {
        "Name": "TAT_VW_032",
        "LocalizedName": "Play Your Ace",
        "HashNameMale": "MP_Vinewood_Tat_032_M",
        "HashNameFemale": "MP_Vinewood_Tat_032_F",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 42885
    }
];

const mpbusiness_overlays = [
    {
        "Name": "TAT_BUS_005",
        "LocalizedName": "Cash is King",
        "HashNameMale": "MP_Buis_M_Neck_000",
        "HashNameFemale": "",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 5000
    },
    {
        "Name": "TAT_BUS_006",
        "LocalizedName": "Bold Dollar Sign",
        "HashNameMale": "MP_Buis_M_Neck_001",
        "HashNameFemale": "",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 1600
    },
    {
        "Name": "TAT_BUS_007",
        "LocalizedName": "Script Dollar Sign",
        "HashNameMale": "MP_Buis_M_Neck_002",
        "HashNameFemale": "",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 1750
    },
    {
        "Name": "TAT_BUS_008",
        "LocalizedName": "$100",
        "HashNameMale": "MP_Buis_M_Neck_003",
        "HashNameFemale": "",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 6900
    },
    {
        "Name": "TAT_BUS_003",
        "LocalizedName": "$100 Bill",
        "HashNameMale": "MP_Buis_M_LeftArm_000",
        "HashNameFemale": "",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 3500
    },
    {
        "Name": "TAT_BUS_004",
        "LocalizedName": "All-Seeing Eye",
        "HashNameMale": "MP_Buis_M_LeftArm_001",
        "HashNameFemale": "",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 7300
    },
    {
        "Name": "TAT_BUS_009",
        "LocalizedName": "Dollar Skull",
        "HashNameMale": "MP_Buis_M_RightArm_000",
        "HashNameFemale": "",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 4800
    },
    {
        "Name": "TAT_BUS_010",
        "LocalizedName": "Green",
        "HashNameMale": "MP_Buis_M_RightArm_001",
        "HashNameFemale": "",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 1500
    },
    {
        "Name": "TAT_BUS_011",
        "LocalizedName": "Refined Hustler",
        "HashNameMale": "MP_Buis_M_Stomach_000",
        "HashNameFemale": "",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 6400
    },
    {
        "Name": "TAT_BUS_001",
        "LocalizedName": "Rich",
        "HashNameMale": "MP_Buis_M_Chest_000",
        "HashNameFemale": "",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 3250
    },
    {
        "Name": "TAT_BUS_002",
        "LocalizedName": "$$$",
        "HashNameMale": "MP_Buis_M_Chest_001",
        "HashNameFemale": "",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 3500
    },
    {
        "Name": "TAT_BUS_000",
        "LocalizedName": "Makin' Paper",
        "HashNameMale": "MP_Buis_M_Back_000",
        "HashNameFemale": "",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 5500
    },
    {
        "Name": "TAT_BUS_F_002",
        "LocalizedName": "High Roller",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Chest_000",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 7000
    },
    {
        "Name": "TAT_BUS_F_003",
        "LocalizedName": "Makin' Money",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Chest_001",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 7200
    },
    {
        "Name": "TAT_BUS_F_004",
        "LocalizedName": "Love Money",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Chest_002",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 1600
    },
    {
        "Name": "TAT_BUS_F_011",
        "LocalizedName": "Diamond Back",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Stom_000",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 6800
    },
    {
        "Name": "TAT_BUS_F_012",
        "LocalizedName": "Santo Capra Logo",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Stom_001",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 1800
    },
    {
        "Name": "TAT_BUS_F_013",
        "LocalizedName": "Money Bag",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Stom_002",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 1500
    },
    {
        "Name": "TAT_BUS_F_000",
        "LocalizedName": "Respect",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Back_000",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 4200
    },
    {
        "Name": "TAT_BUS_F_001",
        "LocalizedName": "Gold Digger",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Back_001",
        "Zone": "ZONE_TORSO",
        "ZoneID": 0,
        "Price": 4000
    },
    {
        "Name": "TAT_BUS_F_007",
        "LocalizedName": "Val-de-Grace Logo",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Neck_000",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 1900
    },
    {
        "Name": "TAT_BUS_F_008",
        "LocalizedName": "Money Rose",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_Neck_001",
        "Zone": "ZONE_HEAD",
        "ZoneID": 1,
        "Price": 2500
    },
    {
        "Name": "TAT_BUS_F_009",
        "LocalizedName": "Dollar Sign",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_RArm_000",
        "Zone": "ZONE_RIGHT_ARM",
        "ZoneID": 3,
        "Price": 4900
    },
    {
        "Name": "TAT_BUS_F_005",
        "LocalizedName": "Greed is Good",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_LArm_000",
        "Zone": "ZONE_LEFT_ARM",
        "ZoneID": 2,
        "Price": 5500
    },
    {
        "Name": "TAT_BUS_F_006",
        "LocalizedName": "Single",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_LLeg_000",
        "Zone": "ZONE_LEFT_LEG",
        "ZoneID": 4,
        "Price": 4850
    },
    {
        "Name": "TAT_BUS_F_010",
        "LocalizedName": "Diamond Crown",
        "HashNameMale": "",
        "HashNameFemale": "MP_Buis_F_RLeg_000",
        "Zone": "ZONE_RIGHT_LEG",
        "ZoneID": 5,
        "Price": 4500
    }
];

class Tattoos {
    static LocalPlayer;
    static _tattoStoreIdentifier = 'tattoStoreData';
    static _tatPurchaseEvent = "server:purchaseTattoos";
    static currentTattooLibView;
    static tattoData = [
        { name: "mpsmuggler_overlays", data: mpsmuggler_overlays },
        { name: "mpvinewood_overlays", data: mpvinewood_overlays },
        { name: "mpbusiness_overlays", data: mpbusiness_overlays }
    ];
    constructor() {
        Tattoos.LocalPlayer = mp.players.local;
        mp.events.add('tat:setTatto', Tattoos.setTattooData);
        mp.events.add('tat:purchase', Tattoos.purchaseTattoos);
        mp.events.add('tat:resync', () => Tattoos.setDbTats(Tattoos.LocalPlayer, getUserCharacterData()?.characterModel));
        mp.events.add('render', Tattoos.handleRender);
        mp.keys.bind(_control_ids.Y, false, Tattoos.handleKeyPress);
    }
    static handleRender() {
        if (Tattoos.LocalPlayer.browserRouter == Browsers.Tattoos) {
            DeathSystem.disableControls();
        }
    }
    static async handleKeyPress() {
        if (!validateKeyPress(true))
            return;
        let tattooShopData = Tattoos.LocalPlayer.getVariable(Tattoos._tattoStoreIdentifier);
        let charData = getUserCharacterData();
        if (tattooShopData && charData) {
            Tattoos.tattoData.forEach(data => {
                if (data.name == tattooShopData?.overlayDlc) {
                    Tattoos.currentTattooLibView = tattooShopData?.overlayDlc;
                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
						_mutationKey: "tattoo_store_data",
						data: ${JSON.stringify(data.data)}
					})`);
                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
						_mutationKey: "player_current_tats",
						data: ${JSON.stringify(charData?.characterModel.player_tattos)}
					})`);
                    BrowserSystem.pushRouter(Browsers.Tattoos);
                }
            });
        }
    }
    static async setTattooData(overlay, parse = true, collection = Tattoos.currentTattooLibView) {
        Tattoos.LocalPlayer.clearDecorations();
        let charData = getUserCharacterData();
        if (!charData)
            return;
        Tattoos.setDbTats(Tattoos.LocalPlayer, charData.characterModel);
        let tatArr = overlay;
        if (parse) {
            tatArr = JSON.parse(overlay);
        }
        await mp.game.waitAsync(50);
        tatArr.forEach((data) => {
            if (charData) {
                Tattoos.LocalPlayer.setDecoration(mp.game.joaat(collection), mp.game.joaat(charData.characterModel.sex ? data.male : data.female));
            }
        });
    }
    static async setDbTats(entity, charModel) {
        if (!entity)
            return;
        if ((entity.type == "player" && !mp.players.atHandle(entity.handle)) || entity.type == "ped" && !mp.peds.atHandle(entity.handle))
            return;
        entity.clearDecorations();
        charModel.player_tattos.forEach(data => {
            entity.setDecoration(mp.game.joaat(data.tattoo_lib), mp.game.joaat(data.tattoo_collection));
        });
    }
    static purchaseTattoos(tattooData) {
        let charData = getUserCharacterData();
        if (!charData)
            return;
        let tats = [];
        JSON.parse(tattooData).forEach((data) => {
            tats.push(charData?.characterModel.sex ? data.male : data.female);
        });
        mp.events.callRemote(Tattoos._tatPurchaseEvent, Tattoos.currentTattooLibView, JSON.stringify(tats));
    }
}

class CharacterSystem {
    static LocalPlayer;
    static serverName = "Cloud Roleplay";
    static discordStatusUpdate_seconds = 15;
    constructor() {
        CharacterSystem.LocalPlayer = mp.players.local;
        mp.events.add("character:setModel", CharacterSystem.setCharacterCustomization);
        mp.events.add("entityStreamIn", CharacterSystem.handleEntityStreamIn);
        mp.events.addDataHandler(_sharedCharacterModelIdentifier, CharacterSystem.handleDataHandler);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, CharacterSystem.handleAdmins);
        CharacterSystem.setDiscordStatus();
        setInterval(() => {
            CharacterSystem.setDiscordStatus();
        }, CharacterSystem.discordStatusUpdate_seconds * 1000);
    }
    static setDiscordStatus() {
        let characterData = getUserCharacterData();
        mp.discord.update(`Playing on ${CharacterSystem.serverName}`, `${characterData ? `Playing as ${characterData.character_name.replace("_", " ")}` : `Currently logged in`}`);
    }
    static async setCharacterCustomization(characterModel, parse = true, entity = mp.players.local) {
        let charData = characterModel;
        if (parse) {
            charData = JSON.parse(characterModel);
        }
        await mp.game.waitAsync(50);
        if (!entity || !charData)
            return;
        if ((entity.type == "ped" && mp.peds.exists(entity)) || (entity.type == "player" && mp.players.exists(entity))) {
            let female = mp.game.joaat("mp_m_freemode_01");
            let male = mp.game.joaat("mp_f_freemode_01");
            entity.model = charData?.sex ? female : male;
            entity.setHeading(parseInt(charData.rotation));
            entity.setComponentVariation(2, parseInt(charData.hairStyle), 0, 0);
            entity.setHairColor(parseInt(charData.hairColour), parseInt(charData.hairHighlights));
            entity.setHeadOverlay(1, parseInt(charData.facialHairStyle), 1.0, parseInt(charData.facialHairColour), 0);
            entity.setEyeColor(parseInt(charData.eyeColour));
            entity.setHeadOverlay(10, parseInt(charData.chestHairStyle), 1.0, 0, 0);
            entity.setHeadOverlay(2, parseInt(charData.eyebrowsStyle), 1.0, parseInt(charData.eyebrowsColour), 0);
            entity.setHeadOverlay(5, parseInt(charData.blushStyle), 1.0, parseInt(charData.blushColour), 0);
            entity.setHeadOverlay(8, parseInt(charData.lipstick), 1.0, 0, 0);
            entity.setHeadOverlay(0, parseInt(charData.blemishes), 1.0, 0, 0);
            entity.setHeadOverlay(3, parseInt(charData.ageing), 1.0, 0, 0);
            entity.setHeadOverlay(6, parseInt(charData.complexion), 1.0, 0, 0);
            entity.setHeadOverlay(7, parseInt(charData.sunDamage), 1.0, 0, 0);
            entity.setHeadOverlay(9, parseInt(charData.molesFreckles), 1.0, 0, 0);
            entity.setHeadOverlay(4, parseInt(charData.makeup), 1.0, 0, 0);
            entity.setFaceFeature(0, parseInt(charData.noseWidth) / 10);
            entity.setFaceFeature(1, parseInt(charData.noseHeight) / 10);
            entity.setFaceFeature(2, parseInt(charData.noseLength) / 10);
            entity.setFaceFeature(3, parseInt(charData.noseBridge) / 10);
            entity.setFaceFeature(4, parseInt(charData.noseTip) / 10);
            entity.setFaceFeature(5, parseInt(charData.noseBridgeShift) / 10);
            entity.setFaceFeature(6, parseInt(charData.browHeight) / 10);
            entity.setFaceFeature(7, parseInt(charData.browWidth) / 10);
            entity.setFaceFeature(8, parseInt(charData.cheekBoneHeight) / 10);
            entity.setFaceFeature(9, parseInt(charData.cheekBoneWidth) / 10);
            entity.setFaceFeature(10, parseInt(charData.cheeksWidth) / 10);
            entity.setFaceFeature(11, parseInt(charData.eyes) / 10);
            entity.setFaceFeature(12, parseInt(charData.lips) / 10);
            entity.setFaceFeature(13, parseInt(charData.jawWidth) / 10);
            entity.setFaceFeature(14, parseInt(charData.jawHeight) / 10);
            entity.setFaceFeature(15, parseInt(charData.chinLength) / 10);
            entity.setFaceFeature(16, parseInt(charData.chinPosition) / 10);
            entity.setFaceFeature(17, parseInt(charData.chinWidth) / 10);
            entity.setFaceFeature(18, parseInt(charData.chinShape) / 10);
            entity.setFaceFeature(19, parseInt(charData.neckWidth) / 10);
            entity.setHeadBlendData(parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, Number(charData.headMix) * 0.01, Number(charData.skinMix) * 0.01, 0, false);
            if (charData.player_tattos && charData.player_tattos.length > 0) {
                Tattoos.setDbTats(entity, charData);
            }
        }
    }
    static handleAdmins(entity, data) {
        if (entity.type != "player" || !data)
            return;
        if (data && data.showAdminPed) {
            entity.model = mp.game.joaat(data.admin_ped);
        }
    }
    static handleEntityStreamIn(entity) {
        if (entity.type != "player")
            return;
        let characterData = getTargetCharacterData(entity);
        let userData = getTargetData(entity);
        if (!userData || !characterData)
            return;
        if (userData.showAdminPed) {
            entity.model = mp.game.joaat(userData.admin_ped);
            return;
        }
        CharacterSystem.setCharacterCustomization(characterData.characterModel, false, entity);
    }
    static handleDataHandler(entity, data) {
        if (entity.type != "player" || !data)
            return;
        let userData = getTargetData(entity);
        if (!userData)
            return;
        if (userData.showAdminPed) {
            entity.model = mp.game.joaat(userData.admin_ped);
            return;
        }
        CharacterSystem.setCharacterCustomization(data, false, entity);
    }
}

class AntiCheat {
    static LocalPlayer;
    static active;
    static flags;
    static hits;
    static reloadingWeapon;
    static position;
    static health;
    static weapon;
    static magazine;
    static firstShot;
    static range_to_btm;
    static blockedVehicleClasses = [16, 15];
    static blockedHashes = [1119849093, -1312131151, -1355376991, 1198256469, 1834241177, -1238556825, -1568386805, -1312131151, 125959754, 1672152130];
    static loop;
    static detectionEvent = "server:CheatDetection";
    static clientFps;
    static lastFrameCount;
    constructor() {
        AntiCheat.LocalPlayer = mp.players.local;
        AntiCheat.active = true;
        AntiCheat.loop = AntiCheat.secs();
        AntiCheat.flags = 0;
        AntiCheat.hits = 0;
        AntiCheat.reloadingWeapon = false;
        AntiCheat.position = AntiCheat.LocalPlayer.position;
        AntiCheat.health = Number(mp.players.local.getHealth()) + Number(mp.players.local.getArmour());
        AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle);
        AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(AntiCheat.weapon);
        AntiCheat.firstShot = true;
        mp.events.add("render", AntiCheat.handleRender);
        mp.events.add("client:weaponSwap", AntiCheat.allowWeaponSwitch);
        mp.events.add("client:acSleep", AntiCheat.sleep);
        mp.events.add("playerWeaponShot", AntiCheat.handleWeaponShot);
        mp.keys.bind(_control_ids.RELOADBIND, true, AntiCheat.handleReload);
        setInterval(() => {
            let hp = AntiCheat.health;
            setTimeout(() => {
                if (AntiCheat.LocalPlayer.getArmour() + AntiCheat.LocalPlayer.getHealth() > hp && AntiCheat.active) {
                    AntiCheat.alertAdmins(AcExceptions.healthKey, "Healkey | Unexpected HP added");
                }
            }, 400);
        }, 500);
        setInterval(() => {
            AntiCheat.clientFps = AntiCheat.getFrameCount() - AntiCheat.lastFrameCount;
            AntiCheat.LocalPlayer.fps = AntiCheat.clientFps;
            AntiCheat.lastFrameCount = AntiCheat.getFrameCount();
        }, 1000);
    }
    static getFrameCount() {
        return mp.game.invoke("0xFC8202EFC642E6F2");
    }
    static allowWeaponSwitch() {
        AntiCheat.resetWeapon();
    }
    static handleWeaponShot() {
        let userData = getUserData();
        if (userData && (userData.adminDuty || userData.admin_status > AdminRanks.Admin_HeadAdmin))
            return;
        if (AntiCheat.checkWeaponhash()) {
            AntiCheat.alertAdmins(AcExceptions.disallowedWeapon, "Disallowed weapon");
        }
        if (AntiCheat.reloadingWeapon) {
            AntiCheat.alertAdmins(AcExceptions.noReloadHack, "Possible no reload weapon hack");
            AntiCheat.resetWeapon();
        }
        if (AntiCheat.LocalPlayer.getAmmoInClip(AntiCheat.LocalPlayer.weapon) > 70) {
            AntiCheat.alertAdmins(AcExceptions.ammoHack, "Possible ammo clip cheat ammo in clip is " + AntiCheat.LocalPlayer.getAmmoInClip(mp.players.local.weapon));
        }
        AntiCheat.updateMagSize();
    }
    static handleRender() {
        AntiCheat.health = Number(mp.players.local.getHealth()) + Number(mp.players.local.getArmour());
        if (AntiCheat.active) {
            let Difference = AntiCheat.subtractVector(AntiCheat.position, AntiCheat.LocalPlayer.position);
            if (Math.abs(Difference.x) > 30 || Math.abs(Difference.y) > 30) {
                if (AntiCheat.isWalking()) {
                    AntiCheat.alertAdmins(AcExceptions.tpHack, "Possible teleport hack");
                }
            }
            if (AntiCheat.LocalPlayer.vehicle && (AntiCheat.checkCarPos(25) || AntiCheat.VehicleFasterThan(200))) {
                AntiCheat.alertAdmins(AcExceptions.vehicleSpeedOrFly, "Possible vehicle fly or speed hack");
            }
        }
        AntiCheat.position = mp.players.local.position;
        AntiCheat.loop = AntiCheat.secs() + 3;
    }
    static handleReload() {
        AntiCheat.reloadingWeapon = true;
        setTimeout(() => {
            AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(mp.game.invoke("0x0A6DB4965674D243", mp.players.local.handle));
            AntiCheat.reloadingWeapon = false;
        }, 2000);
    }
    static sleep(duration) {
        AntiCheat.active = false;
        setTimeout(() => {
            AntiCheat.active = true;
        }, duration * 1000);
    }
    static alertAdmins(exception, message) {
        //mp.events.callRemote(AntiCheat.detectionEvent, exception, message);
    }
    static secs() {
        return Math.round(Date.now() / 1000);
    }
    static isRagdollOnHeight(height) {
        AntiCheat.range_to_btm = mp.game.gameplay.getGroundZFor3dCoord(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true, false);
        if (Math.abs(AntiCheat.LocalPlayer.position.z - AntiCheat.range_to_btm) > Math.abs(height - AntiCheat.range_to_btm)) {
            if (!this.isWalking()) {
                return false;
            }
            else if (AntiCheat.active && AntiCheat.range_to_btm > 0) {
                return true;
            }
            return false;
        }
        return false;
    }
    static isWalking() {
        if (mp.players.local.isFalling() || mp.players.local.isRagdoll())
            return false;
        else if (!mp.players.local.vehicle)
            return true;
        return false;
    }
    static subtractVector(v1, v2) {
        let subtractResult = {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
        return subtractResult;
    }
    static VehicleFasterThan(max) {
        if (AntiCheat.LocalPlayer.vehicle && AntiCheat.blockedVehicleClasses.indexOf(AntiCheat.LocalPlayer.vehicle.getClass()) == -1) {
            return mp.players.local.vehicle.getSpeed() * 3.6 > max;
        }
        return false;
    }
    static checkCarPos(maxHeight = 50) {
        if (AntiCheat.LocalPlayer) {
            if (AntiCheat.LocalPlayer.vehicle.getClass() != 15 && AntiCheat.LocalPlayer.vehicle.getClass() != 16) {
                let pos = AntiCheat.LocalPlayer.position;
                AntiCheat.range_to_btm = mp.game.gameplay.getGroundZFor3dCoord(pos.x, pos.y, pos.z, false, false);
                if (pos.z - AntiCheat.range_to_btm > maxHeight + AntiCheat.range_to_btm) {
                    return true;
                }
                return false;
            }
        }
        return false;
    }
    static checkWeaponhash() {
        let h = AntiCheat.weapon;
        if (AntiCheat.blockedHashes.indexOf(h) != -1) {
            return true;
        }
        return false;
    }
    static resetWeapon() {
        AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, AntiCheat.LocalPlayer.handle);
        AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(AntiCheat.weapon);
        AntiCheat.reloadingWeapon = false;
    }
    static updateMagSize() {
        AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle);
        if (AntiCheat.firstShot) {
            AntiCheat.firstShot = false;
            AntiCheat.resetWeapon();
        }
        AntiCheat.magazine -= 1;
        if (AntiCheat.magazine <= 0) {
            AntiCheat.reloadingWeapon = true;
            setTimeout(() => {
                AntiCheat.reloadingWeapon = false;
                AntiCheat.resetWeapon();
            }, 1250);
        }
    }
}
var AcExceptions;
(function (AcExceptions) {
    AcExceptions[AcExceptions["tpHack"] = 0] = "tpHack";
    AcExceptions[AcExceptions["disallowedWeapon"] = 1] = "disallowedWeapon";
    AcExceptions[AcExceptions["vehicleSpeedOrFly"] = 2] = "vehicleSpeedOrFly";
    AcExceptions[AcExceptions["noReloadHack"] = 3] = "noReloadHack";
    AcExceptions[AcExceptions["ammoHack"] = 4] = "ammoHack";
    AcExceptions[AcExceptions["healthKey"] = 5] = "healthKey";
})(AcExceptions || (AcExceptions = {}));

const getClothingData = (entity) => {
    return entity.getVariable(_sharedClothingDataIdentifier);
};

var torsoDataMale = {
	"0": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"1": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"2": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"3": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"4": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"5": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"6": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"7": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"8": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"9": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"10": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"11": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"12": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"13": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"14": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"15": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"16": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"17": {
	"0": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	}
},
	"18": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"19": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"20": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"21": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"22": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"23": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"24": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"25": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"26": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"27": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"28": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"29": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"30": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"31": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"32": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"33": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"34": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"35": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"36": {
	"0": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	}
},
	"37": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"38": {
	"0": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	}
},
	"39": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"40": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"41": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"42": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"43": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"44": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"45": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"46": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"47": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"48": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"49": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"50": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"51": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"52": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"53": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"54": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"55": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"56": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"57": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"58": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"59": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"60": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"61": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"62": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"63": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"64": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"65": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"66": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"67": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"68": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"69": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"70": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"71": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"72": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"73": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"74": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"75": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"76": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"77": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"78": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"79": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"80": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"81": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"82": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"83": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"84": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"85": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"86": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"87": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"88": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"89": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"90": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"91": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"92": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"93": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"94": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"95": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"96": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"97": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"98": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"99": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"100": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"101": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"102": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"103": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"104": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"105": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"106": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"107": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"108": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"109": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"110": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"111": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"112": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"113": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"114": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"115": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"116": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"117": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"118": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"119": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"120": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"121": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"122": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"123": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"124": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"125": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"126": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"127": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"128": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"129": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"130": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"131": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"132": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"133": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"134": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"135": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"136": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"137": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"138": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"139": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"140": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"141": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"142": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"143": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"144": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"145": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"146": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"147": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"148": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"149": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"150": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"151": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"152": {
	"0": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 1
	},
	"2": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 2
	},
	"3": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 3
	},
	"4": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 4
	},
	"5": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 5
	},
	"6": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 6
	},
	"7": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 7
	},
	"8": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 8
	},
	"9": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 9
	},
	"10": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 10
	},
	"11": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 11
	},
	"12": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 12
	},
	"13": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 13
	},
	"14": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 14
	},
	"15": {
		BestTorsoDrawable: 111,
		BestTorsoTexture: 15
	}
},
	"153": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"154": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"155": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"156": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"157": {
	"0": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	}
},
	"158": {
	"0": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	}
},
	"159": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"160": {
	"0": {
		BestTorsoDrawable: 115,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 115,
		BestTorsoTexture: 0
	}
},
	"161": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"162": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"163": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"164": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"165": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"166": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"167": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"168": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"169": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"170": {
	"0": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	}
},
	"171": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"172": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"173": {
	"0": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	}
},
	"174": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"175": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"176": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"177": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"178": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"179": {
	"0": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	}
},
	"180": {
	"0": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	}
},
	"181": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"182": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"183": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"184": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"185": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"186": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"187": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"188": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"189": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"190": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"191": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"192": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"193": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"194": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"195": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"196": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"197": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"198": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"199": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"200": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"201": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"202": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"203": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"204": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"205": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"206": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"207": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"208": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"209": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"210": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"211": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"212": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"213": {
	"0": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"214": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"215": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"216": {
	"0": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 112,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"217": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"218": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"219": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"220": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"221": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"222": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"223": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"224": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"225": {
	"0": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	}
},
	"226": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"227": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"228": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"229": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"230": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"231": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"232": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"233": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"234": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"235": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"236": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"237": {
	"0": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 5,
		BestTorsoTexture: 0
	}
},
	"238": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"239": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"240": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"241": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"242": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"243": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"244": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"245": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"246": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"247": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"248": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"249": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"250": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"251": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"252": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"253": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"254": {
	"0": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	}
},
	"255": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"256": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"257": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"258": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"259": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"260": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"261": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"262": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"263": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"264": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"265": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"266": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"267": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"268": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"269": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"270": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"271": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"272": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"273": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"274": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"275": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"276": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"277": {
	"0": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 1
	},
	"2": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 2
	},
	"3": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 3
	},
	"4": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 4
	},
	"5": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 5
	},
	"6": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 6
	},
	"7": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 7
	},
	"8": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 8
	},
	"9": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 9
	},
	"10": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 10
	},
	"11": {
		BestTorsoDrawable: 164,
		BestTorsoTexture: 11
	}
},
	"278": {
	"0": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 1
	},
	"2": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 2
	},
	"3": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 3
	},
	"4": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 4
	},
	"5": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 5
	},
	"6": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 6
	},
	"7": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 7
	},
	"8": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 8
	},
	"9": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 9
	},
	"10": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 10
	},
	"11": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 11
	},
	"12": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 12
	},
	"13": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 13
	},
	"14": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 14
	},
	"15": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 15
	},
	"16": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 16
	},
	"17": {
		BestTorsoDrawable: 165,
		BestTorsoTexture: 17
	}
},
	"279": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"280": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"281": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"282": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"283": {
	"0": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 1
	},
	"2": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 2
	},
	"3": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 3
	},
	"4": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 4
	},
	"5": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 5
	},
	"6": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 6
	},
	"7": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 7
	},
	"8": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 8
	},
	"9": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 9
	},
	"10": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 10
	},
	"11": {
		BestTorsoDrawable: 166,
		BestTorsoTexture: 11
	}
},
	"284": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"285": {
	"0": {
		BestTorsoDrawable: 17,
		BestTorsoTexture: 0
	}
},
	"286": {
	"0": {
		BestTorsoDrawable: 167,
		BestTorsoTexture: 0
	}
},
	"287": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"288": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"289": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"290": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"291": {
	"0": {
		BestTorsoDrawable: 168,
		BestTorsoTexture: 0
	}
},
	"292": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"293": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"294": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"295": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"296": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"297": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"298": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"299": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"300": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"301": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"302": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"303": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"304": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"305": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"306": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"307": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"308": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"309": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"310": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"311": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"312": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"313": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"314": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"315": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"316": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"317": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"318": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"319": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"320": {
	"0": {
		BestTorsoDrawable: 17,
		BestTorsoTexture: 0
	}
},
	"321": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"322": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"323": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"324": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"325": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"326": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"327": {
	"0": {
		BestTorsoDrawable: 113,
		BestTorsoTexture: 0
	}
},
	"328": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"329": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"330": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"331": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"332": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"333": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"334": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"335": {
	"0": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	}
},
	"336": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"337": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"338": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"339": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"9": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"10": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"11": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"12": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"13": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"14": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"15": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"16": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"17": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"18": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"19": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"20": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"21": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"22": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"23": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"340": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"1": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"2": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"3": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"4": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"5": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"6": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"7": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	},
	"8": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"341": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"342": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"343": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"344": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"345": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"346": {
	"0": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	}
},
	"347": {
	"0": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	}
},
	"348": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"349": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"350": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"351": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"352": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"353": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"354": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"355": {
	"0": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 184,
		BestTorsoTexture: 0
	}
},
	"356": {
	"0": {
		BestTorsoDrawable: 8,
		BestTorsoTexture: 0
	}
},
	"357": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"358": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"359": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"360": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"361": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"362": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"363": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"364": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"365": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"366": {
	"0": {
		BestTorsoDrawable: 115,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 115,
		BestTorsoTexture: 0
	}
},
	"367": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"368": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"369": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"370": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"371": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"372": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"373": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"374": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"375": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"376": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"377": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"378": {
	"0": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 12,
		BestTorsoTexture: 0
	}
},
	"379": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"380": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"381": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"382": {
	"0": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	}
},
	"383": {
	"0": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 196,
		BestTorsoTexture: 0
	}
},
	"384": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"385": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"386": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"387": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"388": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"389": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"390": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"391": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"392": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"393": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"394": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"395": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"396": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"397": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"398": {
	"0": {
		BestTorsoDrawable: 197,
		BestTorsoTexture: 0
	}
},
	"399": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"400": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"401": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"402": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"403": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"404": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"405": {
	"0": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	}
},
	"406": {
	"0": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	}
},
	"407": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"408": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"409": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"410": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"411": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"412": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"413": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"414": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"415": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"416": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"417": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"418": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"419": {
	"0": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"420": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"421": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"422": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"423": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"424": {
	"0": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 114,
		BestTorsoTexture: 0
	}
},
	"425": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"426": {
	"0": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 2,
		BestTorsoTexture: 0
	}
},
	"427": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"428": {
	"0": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	}
},
	"429": {
	"0": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 198,
		BestTorsoTexture: 0
	}
},
	"430": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"431": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"432": {
	"0": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 6,
		BestTorsoTexture: 0
	}
},
	"433": {
	"0": {
		BestTorsoDrawable: 11,
		BestTorsoTexture: 0
	}
},
	"434": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"435": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"436": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"437": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"438": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"439": {
	"0": {
		BestTorsoDrawable: -1,
		BestTorsoTexture: -1
	}
},
	"440": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"441": {
	"0": {
		BestTorsoDrawable: 14,
		BestTorsoTexture: 0
	}
},
	"442": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"443": {
	"0": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 4,
		BestTorsoTexture: 0
	}
},
	"444": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"445": {
	"0": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 0,
		BestTorsoTexture: 0
	}
},
	"446": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 3,
		BestTorsoTexture: 0
	}
},
	"447": {
	"0": {
		BestTorsoDrawable: 209,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 209,
		BestTorsoTexture: 0
	}
},
	"448": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"2": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"3": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"4": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"5": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"6": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"7": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"8": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"9": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"10": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"11": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"12": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"13": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"14": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"15": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"16": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"17": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"18": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"19": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"20": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"21": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"22": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"23": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"24": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	},
	"25": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"449": {
	"0": {
		BestTorsoDrawable: 1,
		BestTorsoTexture: 0
	}
},
	"450": {
	"0": {
		BestTorsoDrawable: 75,
		BestTorsoTexture: 0
	},
	"1": {
		BestTorsoDrawable: 209,
		BestTorsoTexture: 0
	}
}
};

class Clothing {
    static LocalPlayer;
    static _clothingStoreIdentifier = "clothingStoreData";
    constructor() {
        Clothing.LocalPlayer = mp.players.local;
        mp.events.add("entityStreamIn", Clothing.handleStreamIn);
        mp.events.add("render", Clothing.handleRender);
        mp.events.add("clothes:setClothingData", Clothing.setClothingData);
        mp.events.add("clothes:setRot", Clothing.handleRotation);
        mp.events.add("playerExitColshape", Clothing.exitColHandle);
        mp.keys.bind(_control_ids.Y, false, Clothing.handleKeyPressed_Y);
        mp.events.addDataHandler(_sharedClothingDataIdentifier, Clothing.handleStreamIn);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, Clothing.handleDataHandlerAccount);
    }
    static handleRender() {
        if (BrowserSystem.LocalPlayer.browserRouter == Browsers.Clothing) {
            DeathSystem.disableControls();
        }
    }
    static exitColHandle(colshape) {
        if (colshape.getVariable(Clothing._clothingStoreIdentifier) && BrowserSystem.LocalPlayer.browserRouter == Browsers.Clothing) {
            BrowserSystem.pushRouter("/", false);
        }
    }
    static handleRotation(rot) {
        Clothing.LocalPlayer.setHeading(parseInt(rot));
    }
    static handleKeyPressed_Y() {
        if (!Clothing.LocalPlayer.isTypingInTextChat) {
            let currentClothingStoreData = Clothing.LocalPlayer.getVariable(Clothing._clothingStoreIdentifier);
            let playerClothingData = getClothingData(Clothing.LocalPlayer);
            if (currentClothingStoreData && playerClothingData) {
                if (BrowserSystem._browserInstance) {
                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                        _mutationKey: "clothing_data",
                        data: ${JSON.stringify(playerClothingData)}
                    })`);
                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                        _mutationKey: "clothing_data_old",
                        data: ${JSON.stringify(playerClothingData)}
                    })`);
                }
                BrowserSystem.pushRouter(Browsers.Clothing);
            }
        }
    }
    static handleDataHandlerAccount(entity, user) {
        if (entity.type == "player" && getClothingData(entity) && !user?.adminDuty) {
            Clothing.setClothingData(getClothingData(entity), false, true, entity);
        }
    }
    static handleDataHandler(entity, clothingData) {
        if (entity.type == "player" && clothingData) {
            let userData = getTargetData(entity);
            if (userData && !userData.showAdminPed) {
                Clothing.setClothingData(clothingData, false, true, entity);
            }
        }
    }
    static handleStreamIn(entity) {
        if (entity.type == "player" || entity.type == "ped") {
            let clothingData = getClothingData(entity);
            let userData = getTargetData(entity);
            if (!clothingData || !userData)
                return;
            if (!userData.showAdminPed) {
                Clothing.setClothingData(clothingData, false, true, entity);
            }
        }
    }
    static async setClothingData(clothingData, parse, timeout = true, entity = Clothing.LocalPlayer) {
        if (!clothingData)
            return;
        if (parse) {
            clothingData = JSON.parse(clothingData);
        }
        let characterModel = getTargetCharacterData(entity);
        timeout ? await mp.game.waitAsync(300) : null;
        if (!entity || !clothingData)
            return;
        entity.setComponentVariation(1, Number(clothingData.mask), Number(clothingData.mask_texture), 0);
        entity.setComponentVariation(3, Number(clothingData.torso), Number(clothingData.torso_texture), 0);
        entity.setComponentVariation(4, Number(clothingData.leg), Number(clothingData.leg_texture), 0);
        entity.setComponentVariation(5, Number(clothingData.bags), Number(clothingData.bag_texture), 0);
        entity.setComponentVariation(6, Number(clothingData.shoes), Number(clothingData.shoes_texture), 0);
        entity.setComponentVariation(7, Number(clothingData.access), Number(clothingData.access_texture), 0);
        entity.setComponentVariation(8, Number(clothingData.undershirt), Number(clothingData.undershirt_texture), 0);
        entity.setComponentVariation(9, Number(clothingData.armor), Number(clothingData.armor_texture), 0);
        entity.setComponentVariation(10, Number(clothingData.decals), Number(clothingData.decals_texture), 0);
        entity.setComponentVariation(11, Number(clothingData.top), Number(clothingData.top_texture), 0);
        if (characterModel?.characterModel == null || characterModel?.characterModel?.sex == null)
            return;
        let sex = characterModel?.characterModel?.sex;
        if (clothingData.torso > 0)
            return;
        if (sex) {
            if (torsoDataMale[clothingData.top] === undefined || torsoDataMale[clothingData.top][clothingData.top_texture] === undefined) {
                return;
            }
            else {
                if (torsoDataMale[clothingData.top][clothingData.top_texture].BestTorsoDrawable != -1) {
                    entity.setComponentVariation(3, Number(torsoDataMale[clothingData.top][clothingData.top_texture].BestTorsoDrawable), Number(torsoDataMale[clothingData.top][clothingData.top_texture].BestTorsoTexture), 0);
                }
            }
        }
    }
}

class Corpses {
    static LocalPlayer;
    static corpseKey = 'sync:corpsePed';
    static corpseValEvent = 'sync:corpseValidation';
    static corpses = [];
    static _pedTimeout_seconds = 300;
    constructor() {
        Corpses.LocalPlayer = mp.players.local;
        mp.events.add('entityStreamIn', Corpses.handleStreamIn);
        mp.events.add('corpse:add', Corpses.addCorpsePed);
        mp.events.add('corpse:removeCorpse', Corpses.spliceCorpsePed);
        setInterval(() => {
            mp.peds.forEachInStreamRange((ped) => {
                let corpseData = Corpses.corpses.find(corpse => corpse.corpseId == ped.corpseId);
                if (!corpseData)
                    return;
                Corpses.initPed(ped, corpseData);
                if ((getTimeUnix() - corpseData.unixCreated) > Corpses._pedTimeout_seconds) {
                    mp.events.callRemote(Corpses.corpseValEvent, corpseData.corpseId);
                }
            });
        }, 5000);
    }
    static renderCorpses() {
        mp.peds.forEachInStreamRange(ped => {
            if (ped.corpseId !== undefined) {
                if (Corpses.corpses[ped.corpseId]) {
                    let rootBone = ped.getBoneCoords(0, 0, 0, 0);
                    let rootDrawCoords = mp.game.graphics.world3dToScreen2d(new mp.Vector3(rootBone.x, rootBone.y, rootBone.z));
                    mp.game.graphics.drawText(`Corpse ID  ${ped.corpseId} handle ${ped.handle}`, [rootDrawCoords.x, rootDrawCoords.y], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.3, 0.3],
                        outline: true
                    });
                }
            }
        });
    }
    static async handleStreamIn(entity) {
        if (entity.type != 'ped')
            return;
        let corpseData = Corpses.getCorpseData(entity.corpseId);
        if (!corpseData)
            return;
        Corpses.initPed(entity, corpseData);
        Corpses.disableVehCollision(entity);
    }
    static disableVehCollision(entity) {
        mp.vehicles.forEachInStreamRange((veh) => {
            veh.setNoCollision(entity.handle, true);
        });
    }
    static addCorpsePed(corpse) {
        let corpseData = corpse;
        let ped = mp.peds.new(mp.game.joaat(corpse.model.sex ? 'mp_m_freemode_01' : 'mp_f_freemode_01'), new mp.Vector3(corpse.position.x, corpse.position.y, corpse.position.z), 0, 0);
        Corpses.corpses.push(corpse);
        ped.corpseId = corpse.corpseId;
        ped.corpseCharacterId = corpse.characterId;
        ped.taskPlayAnim('dead', 'dead_a', 8.0, 0, 600, 1, 1.0, false, false, false);
        Corpses.initPed(ped, corpseData);
    }
    static spliceCorpsePed(corpseId) {
        let findCorpse = Corpses.corpses.find(cor => cor.corpseId == corpseId);
        if (findCorpse) {
            Corpses.corpses.splice(Corpses.corpses.indexOf(findCorpse), 1);
        }
        mp.peds.forEach((ped) => {
            if (corpseId == ped.corpseId) {
                ped.destroy();
            }
        });
    }
    static getCorpseData(corpseId) {
        let corpseData = null;
        Corpses.corpses.forEach((corpse) => {
            if (corpse.corpseId == corpseId) {
                corpseData = corpse;
            }
        });
        return corpseData;
    }
    static initPed(ped, corpseData) {
        if (ped.handle == 0 || !corpseData)
            return;
        ped.freezePosition(true);
        ped.setInvincible(true);
        ped.setProofs(false, false, false, false, false, false, false, false);
        ped.taskPlayAnim('dead', 'dead_a', 8.0, 0, 600, 1, 1.0, false, false, false);
        Clothing.setClothingData(corpseData.clothes, false, true, ped);
        CharacterSystem.setCharacterCustomization(corpseData.model, false, ped);
    }
}

class AdminEsp {
    static LocalPlayer;
    static _min;
    static _max;
    static _center;
    static _rectWidth;
    static _rectBorder = 0.001;
    static _rectHeight = 0.0065;
    constructor() {
        AdminEsp.LocalPlayer = mp.players.local;
        mp.events.add("render", AdminEsp.handleRender);
    }
    static handleRender() {
        let userData = getUserData();
        if (userData != null && userData.adminDuty && !userData.admin_esp) {
            AdminEsp.renderPlayerEsp();
            Corpses.renderCorpses();
            AdminEsp.renderVehiclesEsp();
        }
    }
    static getCorners(ent) {
        let corners = [];
        const { minimum, maximum } = mp.game.gameplay.getModelDimensions(ent.model);
        AdminEsp._min = minimum;
        AdminEsp._max = maximum;
        AdminEsp._center = new mp.Vector3((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, (minimum.z + maximum.z) / 2);
        corners[0] = new mp.Vector3(AdminEsp._min.x, AdminEsp._max.y, AdminEsp._max.z);
        corners[1] = new mp.Vector3(AdminEsp._max.x, AdminEsp._max.y, AdminEsp._max.z);
        corners[2] = new mp.Vector3(AdminEsp._max.x, AdminEsp._min.y, AdminEsp._max.z);
        corners[3] = new mp.Vector3(AdminEsp._min.x, AdminEsp._min.y, AdminEsp._max.z);
        corners[4] = new mp.Vector3(AdminEsp._min.x, AdminEsp._max.y, AdminEsp._min.z);
        corners[5] = new mp.Vector3(AdminEsp._max.x, AdminEsp._max.y, AdminEsp._min.z);
        corners[6] = new mp.Vector3(AdminEsp._max.x, AdminEsp._min.y, AdminEsp._min.z);
        corners[7] = new mp.Vector3(AdminEsp._min.x, AdminEsp._min.y, AdminEsp._min.z);
        return corners;
    }
    static drawBoxes(ent, corners) {
        const c1 = ent.getOffsetFromInWorldCoords(corners[0].x, corners[0].y, corners[0].z);
        const c2 = ent.getOffsetFromInWorldCoords(corners[1].x, corners[1].y, corners[1].z);
        const c3 = ent.getOffsetFromInWorldCoords(corners[2].x, corners[2].y, corners[2].z);
        const c4 = ent.getOffsetFromInWorldCoords(corners[3].x, corners[3].y, corners[3].z);
        const c5 = ent.getOffsetFromInWorldCoords(corners[4].x, corners[4].y, corners[4].z);
        const c6 = ent.getOffsetFromInWorldCoords(corners[5].x, corners[5].y, corners[5].z);
        const c7 = ent.getOffsetFromInWorldCoords(corners[6].x, corners[6].y, corners[6].z);
        const c8 = ent.getOffsetFromInWorldCoords(corners[7].x, corners[7].y, corners[7].z);
        mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, 244, 155, 255, 255);
        mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, 244, 155, 255, 255);
        mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c4.x, c4.y, c4.z, 244, 155, 255, 255);
        mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c1.x, c1.y, c1.z, 244, 155, 255, 255);
        mp.game.graphics.drawLine(c5.x, c5.y, c5.z, c6.x, c6.y, c6.z, 255, 0, 0, 255);
        mp.game.graphics.drawLine(c6.x, c6.y, c6.z, c7.x, c7.y, c7.z, 255, 0, 0, 255);
        mp.game.graphics.drawLine(c7.x, c7.y, c7.z, c8.x, c8.y, c8.z, 255, 0, 0, 255);
        mp.game.graphics.drawLine(c8.x, c8.y, c8.z, c5.x, c5.y, c5.z, 255, 0, 0, 255);
        mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c5.x, c5.y, c5.z, 155, 255, 245, 255);
        mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c6.x, c6.y, c6.z, 155, 255, 245, 255);
        mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c7.x, c7.y, c7.z, 155, 255, 245, 255);
        mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c8.x, c8.y, c8.z, 155, 255, 245, 255);
    }
    static drawPlayerSkeletons(ent) {
        let userData = getTargetData(ent);
        let rootBone = ent.getBoneCoords(0, 0, 0, 0);
        let head = ent.getBoneCoords(12844, 0, 0, 0);
        let rightF = ent.getBoneCoords(52301, 0, 0, 0);
        let leftF = ent.getBoneCoords(14201, 0, 0, 0);
        let leftH = ent.getBoneCoords(18905, 0, 0, 0);
        let rightH = ent.getBoneCoords(57005, 0, 0, 0);
        let alpha = 255;
        let cl1 = userData?.adminDuty ? 255 : 155;
        let cl2 = userData?.adminDuty ? 0 : 255;
        let cl3 = userData?.adminDuty ? 0 : 245;
        mp.game.graphics.drawLine(rootBone.x, rootBone.y, rootBone.z, head.x, head.y, head.z, cl1, cl2, cl3, alpha);
        mp.game.graphics.drawLine(rightF.x, rightF.y, rightF.z, rootBone.x, rootBone.y, rootBone.z, cl1, cl2, cl3, alpha);
        mp.game.graphics.drawLine(leftF.x, leftF.y, leftF.z, rootBone.x, rootBone.y, rootBone.z, cl1, cl2, cl3, alpha);
        mp.game.graphics.drawLine(head.x, head.y, head.z, leftH.x, leftH.y, leftH.z, cl1, cl2, cl3, alpha);
        mp.game.graphics.drawLine(head.x, head.y, head.z, rightH.x, rightH.y, rightH.z, cl1, cl2, cl3, alpha);
        let drawTextCoordsCenter = mp.game.graphics.world3dToScreen2d(new mp.Vector3(ent.position.x, ent.position.y, ent.position.z));
        let drawTextCoordsHead = mp.game.graphics.world3dToScreen2d(new mp.Vector3(head.x, head.y, head.z));
        let characterData = getTargetCharacterData(ent);
        let dispTextCenter = userData?.adminDuty ? `~r~[ADMIN ON DUTY] ${userData.admin_name}` : `Player (RID #${ent.remoteId}) (Dist ${distBetweenCoords(AdminEsp.LocalPlayer.position, ent.position).toFixed(1)}M) `;
        let dispTextHead = userData?.adminDuty ? "" : `Health ~g~${ent.getHealth()} ~w~Armour: ~b~${ent.getArmour()}`;
        if (characterData != null) {
            dispTextCenter += `\n(CID #${characterData.character_name}) (Name ${characterData.character_name})`;
        }
        AdminEsp.renderText(dispTextCenter, drawTextCoordsCenter);
        AdminEsp.renderText(dispTextHead, drawTextCoordsHead);
        AdminEsp.drawStatusBars(ent);
    }
    static drawStatusBars(entity) {
        let head = entity.getBoneCoords(12844, 0, 0, 0);
        let y2 = head.y + 0.042;
        let x2 = head.x - AdminEsp._rectWidth / 2 - AdminEsp._rectBorder / 2;
        if (entity.getArmour() > 0) {
            mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, 0.0085, 0, 0, 0, 200, false);
            mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 150, 150, 150, 255, false);
            mp.game.graphics.drawRect(x2 - AdminEsp._rectWidth / 2 * (1 - entity.getHealth()), y2, AdminEsp._rectWidth * entity.getHealth(), AdminEsp._rectHeight, 255, 255, 255, 200, false);
            x2 = head.x + AdminEsp._rectWidth / 2 + AdminEsp._rectBorder / 2;
            mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, AdminEsp._rectHeight + AdminEsp._rectBorder * 2, 0, 0, 0, 200, false);
            mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 41, 66, 78, 255, false);
            mp.game.graphics.drawRect(x2 - AdminEsp._rectWidth / 2 * (1 - entity.getArmour()), y2, AdminEsp._rectWidth * entity.getArmour(), AdminEsp._rectHeight, 48, 108, 135, 200, false);
        }
        else {
            mp.game.graphics.drawRect(head.x, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, AdminEsp._rectHeight + AdminEsp._rectBorder * 2, 0, 0, 0, 200, false);
            mp.game.graphics.drawRect(head.x, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 150, 150, 150, 255, false);
            mp.game.graphics.drawRect(head.x - AdminEsp._rectWidth / 2 * (1 - entity.getHealth()), y2, AdminEsp._rectWidth * entity.getHealth(), AdminEsp._rectHeight, 255, 255, 255, 200, false);
        }
    }
    static renderPlayerEsp() {
        mp.players.forEachInStreamRange((ent) => {
            if (ent && ent.handle != AdminEsp.LocalPlayer.handle) {
                let corners = AdminEsp.getCorners(ent);
                AdminEsp.drawBoxes(ent, corners);
                AdminEsp.drawPlayerSkeletons(ent);
            }
        });
    }
    static renderVehiclesEsp() {
        mp.vehicles.forEachInStreamRange((ent) => {
            let corners = AdminEsp.getCorners(ent);
            AdminEsp.drawBoxes(ent, corners);
            let drawTextCoords = mp.game.graphics.world3dToScreen2d(new mp.Vector3(ent.position.x, ent.position.y, ent.position.z));
            let vehicleData = getVehicleData(ent);
            let dispText = `Vehicle (RID #${ent.remoteId}) (Model ${AdminEsp.getVehicleName(ent)}) (Dist ${distBetweenCoords(AdminEsp.LocalPlayer.position, ent.position).toFixed(1)}M) on wheels (${ent.isOnAllWheels()}) `;
            if (vehicleData != null) {
                dispText += `(VID #${vehicleData.vehicle_id}) (Locked ${vehicleData.vehicle_locked}) I = ${vehicleData.indicator_status}`;
            }
            AdminEsp.renderText(dispText, drawTextCoords);
        });
    }
    static getVehicleName(vehicle) {
        let vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(vehicle.model));
        return vehicleName;
    }
    static renderText(text, coords) {
        mp.game.graphics.drawText(text, [coords.x, coords.y], {
            font: 4,
            color: [255, 255, 255, 185],
            scale: [0.3, 0.3],
            outline: true
        });
    }
}

class VehicleSpeedo {
    static LocalPlayer;
    constructor() {
        VehicleSpeedo.LocalPlayer = mp.players.local;
        mp.events.add("playerEnterVehicle", VehicleSpeedo.handleEnter);
        mp.events.add("playerLeaveVehicle", VehicleSpeedo.handleLeave);
        mp.events.add("render", VehicleSpeedo.handleRender);
    }
    static handleEnter(vehicle, seat) {
        if (seat == -1 || seat == 0) {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "speedoUi",
                status: true
            })`);
        }
    }
    static handleLeave(vehicle, seat) {
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
            _stateKey: "speedoUi",
            status: false
        })`);
    }
    static handleRender() {
        if (VehicleSpeedo.LocalPlayer.vehicle && BrowserSystem._browserInstance) {
            let vehicleData = getVehicleData(VehicleSpeedo.LocalPlayer.vehicle);
            if (!vehicleData)
                return;
            let vehicle = VehicleSpeedo.LocalPlayer.vehicle;
            let lightState = vehicle.getLightsState(1, 1);
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleSpeedoData",
                status: ${JSON.stringify({
                vehicleSpeed: vehicle.getSpeed(),
                vehicleRpm: vehicleData.engine_status ? VehicleSpeedo.LocalPlayer.vehicle.rpm : 0,
                indicatorStatus: vehicleData.indicator_status,
                lockStatus: vehicleData.vehicle_locked,
                lightsStates: lightState,
                fuelLevel: vehicleData.vehicle_fuel,
                vehicleMileage: vehicleData.vehicle_distance,
                metric: mp.game.gameplay.getProfileSetting(227),
                numberPlate: vehicle.getNumberPlateText(),
                displayName: vehicleData.vehicle_display_name,
                dbName: vehicleData.vehicle_name,
                vehHealth: vehicle.getHealth(),
                vehicleCruise: vehicleData.speed_limit
            })}
            })`);
        }
    }
}

class VehicleFuel {
    static LocalPlayer;
    static _updateInterval;
    static interval_seconds = 5;
    static updateEvent = "server:updateVehicleFuel";
    constructor() {
        VehicleFuel.LocalPlayer = mp.players.local;
        mp.events.add("playerEnterVehicle", VehicleFuel.handleEnter);
        mp.events.add("playerLeaveVehicle", VehicleFuel.handleExit);
        mp.events.add("render", VehicleFuel.handleRender);
    }
    static handleRender() {
        if (VehicleFuel.LocalPlayer.vehicle && VehicleFuel.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleFuel.LocalPlayer.handle) {
            let vehicleData = getVehicleData(VehicleFuel.LocalPlayer.vehicle);
            if (!vehicleData)
                return;
            if (vehicleData.vehicle_fuel <= 0) {
                VehicleFuel.LocalPlayer.vehicle.setUndriveable(true);
                VehicleFuel.renderNoFuelText();
            }
        }
    }
    static renderNoFuelText() {
        mp.game.graphics.drawText("~r~This vehicle has ran out of fuel.", [0.5, 0.86], {
            font: 4,
            color: [255, 255, 255, 175],
            scale: [0.55, 0.55],
            outline: false
        });
    }
    static handleEnter(vehicle, seat) {
        if (seat == -1) {
            VehicleFuel.closeSaveInterval();
            VehicleFuel._updateInterval = setInterval(() => {
                if (!vehicle) {
                    VehicleFuel.closeSaveInterval();
                    return;
                }
                let vehicleSpeed = vehicle.getSpeed() * 3.6;
                let vehicleData = getVehicleData(vehicle);
                if (vehicleSpeed > 0 && vehicleData?.engine_status) {
                    mp.events.callRemote(VehicleFuel.updateEvent, vehicleSpeed);
                }
            }, VehicleFuel.interval_seconds * 1000);
        }
    }
    static handleExit() {
        VehicleFuel.closeSaveInterval();
    }
    static closeSaveInterval() {
        if (VehicleFuel._updateInterval) {
            clearInterval(VehicleFuel._updateInterval);
            VehicleFuel._updateInterval = undefined;
        }
    }
}

class Afk {
    static LocalPlayer;
    static _updateInterval;
    static updateIntervalTime_seconds = 200;
    static oldPlayerPos;
    static serverEvent = "server:beginAfk";
    constructor() {
        Afk.LocalPlayer = mp.players.local;
        Afk.oldPlayerPos = Afk.LocalPlayer.position;
        Afk.init();
    }
    static init() {
        Afk.close();
        Afk._updateInterval = setInterval(() => {
            if (!getUserCharacterData())
                return;
            let userData = getUserData();
            if (userData && (userData.adminDuty || userData.admin_status > AdminRanks.Admin_HeadAdmin))
                return;
            if (Afk.LocalPlayer.position.equals(Afk.oldPlayerPos)) {
                mp.events.callRemote(Afk.serverEvent);
            }
            Afk.oldPlayerPos = Afk.LocalPlayer.position;
        }, Afk.updateIntervalTime_seconds * 1000);
    }
    static close() {
        if (Afk._updateInterval) {
            clearInterval(Afk._updateInterval);
            Afk._updateInterval = undefined;
        }
    }
}

class VehicleCustoms {
    static LocalPlayer;
    static _colshapeDataIdentifier = 'customsAreaColshapeData';
    static _vehicleDirtLevelIdentifier = 'VehicleDirtLevel';
    constructor() {
        VehicleCustoms.LocalPlayer = mp.players.local;
        mp.events.add('playerExitColshape', VehicleCustoms.handleColEnter);
        mp.events.add('customs:toggleVehicleFreeze', VehicleCustoms.handleVehFreeze);
        mp.events.add('playerLeaveVehicle', VehicleCustoms.handleLeaveVehicle);
        mp.events.add('customs:loadIndexes', VehicleCustoms.loadIndexesIntoBrowser);
        mp.events.add('vehicle:setAttachments', VehicleCustoms.setVehicleAttachments);
        mp.events.add('entityStreamIn', VehicleCustoms.handleStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_MODS_DATA, VehicleCustoms.handleDataHandler_mods_data);
        mp.events.addDataHandler(VehicleCustoms._vehicleDirtLevelIdentifier, VehicleCustoms.handleDataHandler_dirt_level);
        mp.events.add('render', VehicleCustoms.handleRender);
    }
    static handleVehFreeze(tog) {
        if (VehicleCustoms.LocalPlayer.vehicle) {
            VehicleCustoms.LocalPlayer.vehicle.freezePosition(tog);
        }
    }
    static handleLeaveVehicle() {
        if (VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            BrowserSystem.pushRouter('/');
            GuiSystem.toggleHudComplete(true);
        }
    }
    static loadIndexesIntoBrowser() {
        if (!VehicleCustoms.LocalPlayer.vehicle)
            return;
        let veh = VehicleCustoms.LocalPlayer.vehicle;
        VehicleCustoms.handleVehFreeze(true);
        const indexData = [
            { name: 'Front Bumper', modNumber: veh.getNumMods(1) },
            { name: 'Rear Bumper', modNumber: veh.getNumMods(2) },
            { name: 'Side Skirt', modNumber: veh.getNumMods(3) },
            { name: 'Exhaust', modNumber: veh.getNumMods(4) },
            { name: 'Frame', modNumber: veh.getNumMods(5) },
            { name: 'Grille', modNumber: veh.getNumMods(6) },
            { name: 'Hood', modNumber: veh.getNumMods(7) },
            { name: 'Fender', modNumber: veh.getNumMods(8) },
            { name: 'Right Fender', modNumber: veh.getNumMods(9) },
            { name: 'Roof', modNumber: veh.getNumMods(10) },
            { name: 'Engine', modNumber: veh.getNumMods(11) },
            { name: 'Brakes', modNumber: veh.getNumMods(11) },
            { name: 'Transmission', modNumber: veh.getNumMods(13) },
            { name: 'Horns', modNumber: veh.getNumMods(14) },
            { name: 'Suspension', modNumber: veh.getNumMods(15) },
            { name: 'Turbo', modNumber: veh.getNumMods(18) },
            { name: 'Xenon', modNumber: veh.getNumMods(22) },
            { name: 'Front Wheels', modNumber: veh.getNumMods(23) },
            { name: 'Back Wheels', modNumber: veh.getNumMods(24) },
            { name: 'Plate', modNumber: veh.getNumMods(25) },
            { name: 'Trim Design', modNumber: veh.getNumMods(27) },
            { name: 'Ornaments', modNumber: veh.getNumMods(28) },
            { name: 'Dial Design', modNumber: veh.getNumMods(30) },
            { name: 'Steering Wheel', modNumber: veh.getNumMods(33) },
            { name: 'Shift Lever', modNumber: veh.getNumMods(34) },
            { name: 'Plaques', modNumber: veh.getNumMods(35) },
            { name: 'Hydraulics', modNumber: veh.getNumMods(38) },
            { name: 'Boost', modNumber: veh.getNumMods(40) },
            { name: 'Window Tint', modNumber: veh.getNumMods(55) },
            { name: 'Livery', modNumber: veh.getNumMods(48) },
            { name: 'Plate Holders', modNumber: veh.getNumMods(53) },
            { name: 'Colour One', modNumber: veh.getNumMods(66) },
            { name: 'Colour Two', modNumber: veh.getNumMods(67) }
        ];
        BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
            _mutationKey: "vehicle_mod_indexes",
            data: ${JSON.stringify(indexData)}
        })`);
        BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
            _mutationKey: "vehicle_mod_data_old",
            data: ${JSON.stringify(veh.getVariable(_SHARED_VEHICLE_MODS_DATA))}
        })`);
    }
    static handleDataHandler_mods_data(entity, data) {
        if (entity.type != 'vehicle' || !data)
            return;
        VehicleCustoms.setVehicleAttachments(data, false, entity);
    }
    static handleDataHandler_dirt_level(entity, data) {
        if (entity.type != 'vehicle' || data === undefined)
            return;
        entity.setDirtLevel(data);
    }
    static async handleStreamIn(entity) {
        if (entity.type != "vehicle")
            return;
        let vehicleData = getVehicleData(entity);
        let dirtLevel = entity.getVariable(VehicleCustoms._vehicleDirtLevelIdentifier);
        if (vehicleData && dirtLevel !== undefined) {
            VehicleCustoms.setVehicleAttachments(vehicleData.vehicle_mods, false, entity);
            entity.setDirtLevel(dirtLevel);
        }
    }
    static handleRender() {
        if (VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView && VehicleCustoms.LocalPlayer.vehicle) {
            DeathSystem.disableControls();
            VehicleCustoms.LocalPlayer.vehicle.freezePosition(true);
        }
    }
    static handleColEnter(colshape) {
        if (colshape.getVariable(VehicleCustoms._colshapeDataIdentifier) && VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            mp.gui.cursor.show(false, false);
            BrowserSystem.pushRouter('/');
            GuiSystem.toggleHudComplete(true);
        }
    }
    static setVehicleAttachments(data, parse = false, vehicle = VehicleCustoms.LocalPlayer.vehicle) {
        if (!data || !vehicle || vehicle.handle === 0)
            return;
        let modData = data;
        if (parse) {
            modData = JSON.parse(data);
        }
        if (modData.headlight_colour != -1) {
            vehicle.toggleMod(22, true);
            mp.game.invoke(COLOURED_HEADLIGHT_NATIVE, vehicle.handle, Number(modData.headlight_colour));
        }
        else if (modData.xenon != -1) {
            vehicle.setMod(22, Number(modData.xenon));
        }
        vehicle.setWheelType(Number(modData.wheel_type));
        vehicle.setWindowTint(Number(modData.window_tint));
        vehicle.setColours(Number(modData.colour_1), Number(modData.colour_2));
        vehicle.setExtraColours(Number(modData.pearleascent), Number(modData.wheel_colour));
        vehicle.toggleMod(20, true);
        vehicle.setTyreSmokeColor(Number(modData.tyre_smoke_r), Number(modData.tyre_smoke_g), Number(modData.tyre_smoke_b));
        if (Number(modData.neon_colour_r) != -1 || Number(modData.neon_colour_b) != -1 || Number(modData.neon_colour_g) != -1) {
            vehicle.setNeonLightsColour(Number(modData.neon_colour_r), Number(modData.neon_colour_g), Number(modData.neon_colour_b));
            VehicleCustoms.toggleNeons(vehicle, true);
        }
        else {
            VehicleCustoms.toggleNeons(vehicle, false);
        }
        if (modData.wheel_type == 10) {
            vehicle.setDriftTyresEnabled(true);
        }
        else {
            vehicle.setDriftTyresEnabled(false);
        }
        vehicle.setMod(0, Number(modData.spoilers));
        vehicle.setMod(1, Number(modData.front_bumper));
        vehicle.setMod(2, Number(modData.rear_bumper));
        vehicle.setMod(3, Number(modData.side_skirt));
        vehicle.setMod(4, Number(modData.exhaust));
        vehicle.setMod(5, Number(modData.frame));
        vehicle.setMod(6, Number(modData.grille));
        vehicle.setMod(7, Number(modData.hood));
        vehicle.setMod(8, Number(modData.fender));
        vehicle.setMod(9, Number(modData.right_fender));
        vehicle.setMod(10, Number(modData.roof));
        vehicle.setMod(11, Number(modData.engine));
        vehicle.setMod(12, Number(modData.brakes));
        vehicle.setMod(13, Number(modData.transmission));
        vehicle.setMod(14, Number(modData.horns));
        vehicle.setMod(15, Number(modData.suspension));
        vehicle.setMod(16, Number(modData.armor));
        vehicle.setMod(18, Number(modData.turbo));
        vehicle.setMod(23, Number(modData.front_wheels));
        vehicle.setMod(24, Number(modData.back_wheels));
        vehicle.setMod(25, Number(modData.plate_holders));
        vehicle.setMod(27, Number(modData.trim_design));
        vehicle.setMod(28, Number(modData.ornaments));
        vehicle.setMod(30, Number(modData.dial_design));
        vehicle.setMod(33, Number(modData.steering_wheel));
        vehicle.setMod(34, Number(modData.shift_lever));
        vehicle.setMod(35, Number(modData.plaques));
        vehicle.setMod(38, Number(modData.hydraulics));
        vehicle.setMod(40, Number(modData.boost));
        vehicle.setMod(55, Number(modData.window_tint));
        vehicle.setMod(48, Number(modData.livery));
        vehicle.setMod(53, Number(modData.plate));
        vehicle.setMod(66, Number(modData.colour_1));
        vehicle.setMod(67, Number(modData.colour_2));
    }
    static toggleNeons(veh, tog) {
        for (let i = 0; i <= 3; i++) {
            veh.setNeonLightEnabled(i, tog);
        }
    }
}

class ParkingSystem {
    static LocalPlayer;
    static _parkingLotIdentifier = "parkingLotData";
    static _retrievalIdentifier = "retreivalParkingData";
    static viewParkedVehiclesEvent = "server:viewParkedVehicles";
    constructor() {
        ParkingSystem.LocalPlayer = mp.players.local;
        mp.events.add("render", ParkingSystem.handleRender);
        mp.keys.bind(_control_ids.Y, false, ParkingSystem.handleKeyPressed);
    }
    static handleRender() {
        if (ParkingSystem.LocalPlayer.browserRouter == Browsers.Parking && ParkingSystem.LocalPlayer.getVariable(ParkingSystem._retrievalIdentifier)) {
            DeathSystem.disableControls();
        }
    }
    static handleKeyPressed() {
        if (!validateKeyPress(true))
            return;
        let retrieveCol = ParkingSystem.LocalPlayer.getVariable(ParkingSystem._retrievalIdentifier);
        if (retrieveCol) {
            mp.events.callRemote(ParkingSystem.viewParkedVehiclesEvent);
        }
    }
}

var vehicleData = [
	{
		displayName: "V-STR",
		manufacturer: "Albany",
		price: 642500,
		weightKG: 1878,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.25,
		gameMaxSpeedKPH: 159.25,
		model: "vstr",
		hash: 1456336509,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.236114501953125,
		maxBraking: 0.625,
		maxTraction: 2.5799999237060547,
		maxAcceleration: 0.3790000081062317
	},
	{
		displayName: "Buccaneer (Gang)",
		manufacturer: "Albany",
		price: 60000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113,
		gameMaxSpeedKPH: 146,
		model: "buccaneer",
		hash: 3612755468,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.55555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Hermes",
		manufacturer: "Albany",
		price: 267500,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 137,
		model: "hermes",
		hash: 15219735,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.7749999761581421,
		maxTraction: 2.375,
		maxAcceleration: 0.2849999964237213
	},
	{
		displayName: "Police Roadcruiser",
		manufacturer: "Albany",
		price: 100000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 100.5,
		gameMaxSpeedKPH: 140,
		model: "policeold2",
		hash: 2515846680,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Cavalcade II",
		manufacturer: "Albany",
		price: 35000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98,
		gameMaxSpeedKPH: 127,
		model: "cavalcade2",
		hash: 3505073125,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 35.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Cavalcade",
		manufacturer: "Albany",
		price: 30000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98,
		gameMaxSpeedKPH: 127,
		model: "cavalcade",
		hash: 2006918058,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 35.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Roosevelt Valor",
		manufacturer: "Albany",
		price: 491000,
		weightKG: 2420,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 125,
		model: "btype3",
		hash: 3692679425,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Roosevelt",
		manufacturer: "Albany",
		price: 375000,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 125,
		model: "btype",
		hash: 117401876,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Manana",
		manufacturer: "Albany",
		price: 83000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "manana",
		hash: 2170765704,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Fränken Stange",
		manufacturer: "Albany",
		price: 275000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 135,
		model: "btype2",
		hash: 3463132580,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.550000011920929,
		maxTraction: 1.940000057220459,
		maxAcceleration: 0.35499998927116394
	},
	{
		displayName: "Alpha",
		manufacturer: "Albany",
		price: 75000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 150,
		model: "alpha",
		hash: 767087018,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.5,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Washington",
		manufacturer: "Albany",
		price: 7500,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108,
		gameMaxSpeedKPH: 140,
		model: "washington",
		hash: 1777363799,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Primo Custom",
		manufacturer: "Albany",
		price: 200000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103,
		gameMaxSpeedKPH: 140,
		model: "primo2",
		hash: 2254540506,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Primo",
		manufacturer: "Albany",
		price: 4500,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103,
		gameMaxSpeedKPH: 140,
		model: "primo",
		hash: 3144368207,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Emperor",
		manufacturer: "Albany",
		price: 60000,
		weightKG: 1900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.5,
		gameMaxSpeedKPH: 120,
		model: "emperor",
		hash: 3609690755,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Emperor II",
		manufacturer: "Albany",
		price: 60000,
		weightKG: 1900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.5,
		gameMaxSpeedKPH: 120,
		model: "emperor2",
		hash: 2411965148,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Emperor III",
		manufacturer: "Albany",
		price: 100000,
		weightKG: 1900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.5,
		gameMaxSpeedKPH: 120,
		model: "emperor3",
		hash: 3053254478,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Virgo",
		manufacturer: "Albany",
		price: 97500,
		weightKG: 2200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 97.5,
		gameMaxSpeedKPH: 134,
		model: "virgo",
		hash: 3796912450,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.222225189208984,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Lurcher",
		manufacturer: "Albany",
		price: 325000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 146,
		model: "lurcher",
		hash: 2068293287,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.55555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Buccaneer Custom",
		manufacturer: "Albany",
		price: 195000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113,
		gameMaxSpeedKPH: 146,
		model: "buccaneer2",
		hash: 3281516360,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.55555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Nightmare ZR 380",
		manufacturer: "Annis",
		price: 1069320,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 140.5,
		gameMaxSpeedKPH: 158,
		model: "zr3803",
		hash: 2816263004,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.5,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Future Shock ZR 380",
		manufacturer: "Annis",
		price: 1069320,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 140.5,
		gameMaxSpeedKPH: 158,
		model: "zr3802",
		hash: 3188846534,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.5,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Hellion",
		manufacturer: "Annis",
		price: 417500,
		weightKG: 1900,
		drivetrain: "AWD",
		realMaxSpeedMPH: 103.5,
		gameMaxSpeedKPH: 133.5,
		model: "hellion",
		hash: 3932816511,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.083335876464844,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.25
	},
	{
		displayName: "S80RR",
		manufacturer: "Annis",
		price: 1287500,
		weightKG: 900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123,
		gameMaxSpeedKPH: 162.25,
		model: "s80",
		hash: 3970348707,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 45.0694465637207,
		maxBraking: 1.25,
		maxTraction: 39.126251220703125,
		maxAcceleration: 0.3725000023841858
	},
	{
		displayName: "Apocalypse ZR 380",
		manufacturer: "Annis",
		price: 1069320,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 140.5,
		gameMaxSpeedKPH: 158,
		model: "zr380",
		hash: 540101442,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.5,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Savestra",
		manufacturer: "Annis",
		price: 495000,
		weightKG: 880,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 140,
		model: "savestra",
		hash: 903794909,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23749999701976776
	},
	{
		displayName: "RE-7B",
		manufacturer: "Annis",
		price: 1237500,
		weightKG: 880,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 161,
		model: "le7b",
		hash: 3062131285,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.722225189208984,
		maxBraking: 1.100000023841858,
		maxTraction: 3.0082998275756836,
		maxAcceleration: 0.3709999918937683
	},
	{
		displayName: "Elegy RH8",
		manufacturer: "Annis",
		price: 47500,
		weightKG: 1700,
		drivetrain: "AWD",
		realMaxSpeedMPH: 118.5,
		gameMaxSpeedKPH: 152,
		model: "elegy2",
		hash: 3728579874,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.5,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Elegy Retro Custom",
		manufacturer: "Annis",
		price: 452000,
		weightKG: 1450,
		drivetrain: "AWD",
		realMaxSpeedMPH: 115.25,
		gameMaxSpeedKPH: 148,
		model: "elegy",
		hash: 196747873,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Nightmare Bruiser",
		manufacturer: "Benefactor",
		price: 804500,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.5,
		gameMaxSpeedKPH: 130,
		model: "bruiser3",
		hash: 2252616474,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.5,
		maxTraction: 1.75,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Future Shock Bruiser",
		manufacturer: "Benefactor",
		price: 804500,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.5,
		gameMaxSpeedKPH: 130,
		model: "bruiser2",
		hash: 2600885406,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.5,
		maxTraction: 1.75,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Dubsta 2",
		manufacturer: "Benefactor",
		price: 200000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 140,
		model: "dubsta2",
		hash: 3900892662,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Krieger",
		manufacturer: "Benefactor",
		price: 1437500,
		weightKG: 1250,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127.25,
		gameMaxSpeedKPH: 161.8,
		model: "krieger",
		hash: 3630826055,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.9444465637207,
		maxBraking: 1.1200000047683716,
		maxTraction: 29.55875015258789,
		maxAcceleration: 0.37400001287460327
	},
	{
		displayName: "Schlagen GT",
		manufacturer: "Benefactor",
		price: 650000,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125.5,
		gameMaxSpeedKPH: 159.2,
		model: "schlagen",
		hash: 3787471536,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 15.625,
		maxAcceleration: 0.3700000047683716
	},
	{
		displayName: "Apocalypse Bruiser",
		manufacturer: "Benefactor",
		price: 804500,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.5,
		gameMaxSpeedKPH: 130,
		model: "bruiser",
		hash: 668439077,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.5,
		maxTraction: 1.75,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Terrorbyte",
		manufacturer: "Benefactor",
		price: 687500,
		weightKG: 10000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 87.25,
		gameMaxSpeedKPH: 120,
		model: "terbyte",
		hash: 2306538597,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Streiter",
		manufacturer: "Benefactor",
		price: 250000,
		weightKG: 2010,
		drivetrain: "AWD",
		realMaxSpeedMPH: 111.25,
		gameMaxSpeedKPH: 140,
		model: "streiter",
		hash: 1741861769,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.0799999237060547,
		maxAcceleration: 0.21250000596046448
	},
	{
		displayName: "XLS (Armored)",
		manufacturer: "Benefactor",
		price: 261000,
		weightKG: 3000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 132,
		model: "xls2",
		hash: 3862958888,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.66666793823242,
		maxBraking: 0.5899999737739563,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "XLS",
		manufacturer: "Benefactor",
		price: 126500,
		weightKG: 2600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 106,
		gameMaxSpeedKPH: 132,
		model: "xls",
		hash: 1203490606,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.66666793823242,
		maxBraking: 0.5799999833106995,
		maxTraction: 2,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Serrano",
		manufacturer: "Benefactor",
		price: 30000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 101.5,
		gameMaxSpeedKPH: 130,
		model: "serrano",
		hash: 1337041428,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Dubsta",
		manufacturer: "Benefactor",
		price: 200000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 140,
		model: "dubsta",
		hash: 1177543287,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Stirling GT",
		manufacturer: "Benefactor",
		price: 487500,
		weightKG: 1330,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 138,
		model: "feltzer3",
		hash: 2728226064,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.333335876464844,
		maxBraking: 0.800000011920929,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Surano",
		manufacturer: "Benefactor",
		price: 50000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121,
		gameMaxSpeedKPH: 155,
		model: "surano",
		hash: 384071873,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Schwartzer",
		manufacturer: "Benefactor",
		price: 40000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 147,
		model: "schwarzer",
		hash: 3548084598,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Schafter V12",
		manufacturer: "Benefactor",
		price: 58000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 150,
		model: "schafter3",
		hash: 2809443750,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.949999988079071,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Schafter LWB",
		manufacturer: "Benefactor",
		price: 104000,
		weightKG: 1850,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.5,
		gameMaxSpeedKPH: 142,
		model: "schafter4",
		hash: 1489967196,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Feltzer",
		manufacturer: "Benefactor",
		price: 72500,
		weightKG: 1450,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 153,
		model: "feltzer2",
		hash: 2299640309,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.500003814697266,
		maxBraking: 0.800000011920929,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Turreted Limo",
		manufacturer: "Benefactor",
		price: 825000,
		weightKG: 3750,
		drivetrain: "RWD",
		realMaxSpeedMPH: 89.5,
		gameMaxSpeedKPH: 125,
		model: "limo2",
		hash: 4180339789,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.174999952316284,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Schafter V12 (Armored)",
		manufacturer: "Benefactor",
		price: 162500,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 150,
		model: "schafter5",
		hash: 3406724313,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.9200000166893005,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Schafter LWB (Armored)",
		manufacturer: "Benefactor",
		price: 219000,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.25,
		gameMaxSpeedKPH: 142,
		model: "schafter6",
		hash: 1922255844,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 0.8199999928474426,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.1850000023841858
	},
	{
		displayName: "Schafter",
		manufacturer: "Benefactor",
		price: 32500,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.25,
		gameMaxSpeedKPH: 145,
		model: "schafter2",
		hash: 3039514899,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Glendale",
		manufacturer: "Benefactor",
		price: 100000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107,
		gameMaxSpeedKPH: 147,
		model: "glendale",
		hash: 75131841,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23499999940395355
	},
	{
		displayName: "Dubsta 6x6",
		manufacturer: "Benefactor",
		price: 124500,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 137,
		model: "dubsta3",
		hash: 3057713523,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Panto",
		manufacturer: "Benefactor",
		price: 42500,
		weightKG: 800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 100.25,
		gameMaxSpeedKPH: 132,
		model: "panto",
		hash: 3863274624,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.66666793823242,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9700000286102295,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Space Docker",
		manufacturer: "BF",
		price: 100000,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 86.5,
		gameMaxSpeedKPH: 135,
		model: "dune2",
		hash: 534258863,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6299999952316284,
		maxTraction: 2,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Surfer",
		manufacturer: "BF",
		price: 5500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 67.25,
		gameMaxSpeedKPH: 100,
		model: "surfer",
		hash: 699456151,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Surfer II",
		manufacturer: "BF",
		price: 5500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 67.25,
		gameMaxSpeedKPH: 100,
		model: "surfer2",
		hash: 2983726598,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Raptor",
		manufacturer: "BF",
		price: 324000,
		weightKG: 500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 140,
		model: "raptor",
		hash: 3620039993,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.29499998688697815
	},
	{
		displayName: "Ramp Buggy",
		manufacturer: "BF",
		price: 1596000,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113,
		gameMaxSpeedKPH: 150,
		model: "dune4",
		hash: 3467805257,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.8355002403259277,
		maxAcceleration: 0.3240000009536743
	},
	{
		displayName: "Ramp Buggy II",
		manufacturer: "BF",
		price: 1596000,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113,
		gameMaxSpeedKPH: 150,
		model: "dune5",
		hash: 3982671785,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.8355002403259277,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Injection",
		manufacturer: "BF",
		price: 8000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 130,
		model: "bfinjection",
		hash: 1126868326,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6200000047683716,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Dune FAV",
		manufacturer: "BF",
		price: 565250,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 99.75,
		gameMaxSpeedKPH: 135,
		model: "dune3",
		hash: 1897744184,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6299999952316284,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.25
	},
	{
		displayName: "Dune Buggy",
		manufacturer: "BF",
		price: 10000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 100.75,
		gameMaxSpeedKPH: 135,
		model: "dune",
		hash: 2633113103,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6299999952316284,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.25
	},
	{
		displayName: "Bifta",
		manufacturer: "BF",
		price: 37500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.25,
		gameMaxSpeedKPH: 136,
		model: "bifta",
		hash: 3945366167,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.77777862548828,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Prairie",
		manufacturer: "Bollokan",
		price: 12500,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 135,
		model: "prairie",
		hash: 2844316578,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Nightmare Sasquatch",
		manufacturer: "Bravado",
		price: 765437.5,
		weightKG: 4400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 130,
		model: "monster5",
		hash: 3579220348,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.2750000953674316,
		maxAcceleration: 0.4099999964237213
	},
	{
		displayName: "Future Shock Sasquatch",
		manufacturer: "Bravado",
		price: 765437.5,
		weightKG: 4400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 130,
		model: "monster4",
		hash: 840387324,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.2750000953674316,
		maxAcceleration: 0.4099999964237213
	},
	{
		displayName: "Gauntlet Hellfire",
		manufacturer: "Bravado",
		price: 372500,
		weightKG: 1940,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125.25,
		gameMaxSpeedKPH: 155,
		model: "gauntlet4",
		hash: 1934384720,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Gauntlet Classic",
		manufacturer: "Bravado",
		price: 307500,
		weightKG: 1350,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.75,
		gameMaxSpeedKPH: 142,
		model: "gauntlet3",
		hash: 722226637,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Apocalypse Sasquatch",
		manufacturer: "Bravado",
		price: 765437.5,
		weightKG: 4400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 130,
		model: "monster3",
		hash: 1721676810,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.2750000953674316,
		maxAcceleration: 0.4099999964237213
	},
	{
		displayName: "Youga Classic",
		manufacturer: "Bravado",
		price: 67500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 91,
		gameMaxSpeedKPH: 120,
		model: "youga2",
		hash: 1026149675,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Youga",
		manufacturer: "Bravado",
		price: 8000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 96.5,
		gameMaxSpeedKPH: 120,
		model: "youga",
		hash: 65402552,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Rumpo Custom",
		manufacturer: "Bravado",
		price: 65000,
		weightKG: 2250,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 130,
		model: "rumpo3",
		hash: 1475773103,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Rumpo",
		manufacturer: "Bravado",
		price: 6500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 99.25,
		gameMaxSpeedKPH: 130,
		model: "rumpo",
		hash: 1162065741,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Rumpo II",
		manufacturer: "Bravado",
		price: 6500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 99.25,
		gameMaxSpeedKPH: 130,
		model: "rumpo2",
		hash: 2518351607,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Paradise",
		manufacturer: "Bravado",
		price: 12500,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 99.25,
		gameMaxSpeedKPH: 130,
		model: "paradise",
		hash: 1488164764,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Bison",
		manufacturer: "Bravado",
		price: 15000,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 130,
		model: "bison",
		hash: 4278019151,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Bison II",
		manufacturer: "Bravado",
		price: 15000,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 130,
		model: "bison2",
		hash: 2072156101,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Bison III",
		manufacturer: "Bravado",
		price: 15000,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 130,
		model: "bison3",
		hash: 1739845664,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Gresley",
		manufacturer: "Bravado",
		price: 14500,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100.75,
		gameMaxSpeedKPH: 135,
		model: "gresley",
		hash: 2751205197,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Banshee 900R",
		manufacturer: "Bravado",
		price: 282500,
		weightKG: 1150,
		drivetrain: "RWD",
		realMaxSpeedMPH: 131,
		gameMaxSpeedKPH: 150,
		model: "banshee2",
		hash: 633712403,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.33333206176758,
		maxBraking: 1,
		maxTraction: 2.5,
		maxAcceleration: 0.36139997839927673
	},
	{
		displayName: "Verlierer",
		manufacturer: "Bravado",
		price: 347500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 150,
		model: "verlierer2",
		hash: 1102544804,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.430000066757202,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Sprunk Buffalo",
		manufacturer: "Bravado",
		price: 267500,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 116,
		gameMaxSpeedKPH: 147,
		model: "buffalo3",
		hash: 237764926,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Buffalo S",
		manufacturer: "Bravado",
		price: 48000,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.25,
		gameMaxSpeedKPH: 145,
		model: "buffalo2",
		hash: 736902334,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Buffalo",
		manufacturer: "Bravado",
		price: 17500,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.25,
		gameMaxSpeedKPH: 145,
		model: "buffalo",
		hash: 3990165190,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Banshee",
		manufacturer: "Bravado",
		price: 52500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 148,
		model: "banshee",
		hash: 3253274834,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1,
		maxTraction: 2.4200000762939453,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Duneloader",
		manufacturer: "Bravado",
		price: 58000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 79.5,
		gameMaxSpeedKPH: 100,
		model: "dloader",
		hash: 1770332643,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Rat-Truck",
		manufacturer: "Bravado",
		price: 18750,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.25,
		gameMaxSpeedKPH: 135,
		model: "ratloader2",
		hash: 3705788919,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.699999988079071,
		maxTraction: 1.75,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Rat-Loader",
		manufacturer: "Bravado",
		price: 3000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102.5,
		gameMaxSpeedKPH: 135,
		model: "ratloader",
		hash: 3627815886,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Redwood Gauntlet",
		manufacturer: "Bravado",
		price: 115000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.25,
		gameMaxSpeedKPH: 147,
		model: "gauntlet2",
		hash: 349315417,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.509999990463257,
		maxAcceleration: 0.3149999976158142
	},
	{
		displayName: "Gauntlet",
		manufacturer: "Bravado",
		price: 16000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.25,
		gameMaxSpeedKPH: 145,
		model: "gauntlet",
		hash: 2494797253,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Half-track",
		manufacturer: "Bravado",
		price: 1127175,
		weightKG: 10000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 58.25,
		gameMaxSpeedKPH: 75,
		model: "halftrack",
		hash: 4262731174,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 20.83333396911621,
		maxBraking: 0.20000000298023224,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Police Cruiser (Buffalo)",
		manufacturer: "Bravado",
		price: 100000,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.5,
		gameMaxSpeedKPH: 145,
		model: "police2",
		hash: 2667966721,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "FIB (Buffalo)",
		manufacturer: "Bravado",
		price: 100000,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.75,
		gameMaxSpeedKPH: 145,
		model: "fbi",
		hash: 1127131465,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Boxville (LSDWP)",
		manufacturer: "Brute",
		price: 199000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 71.25,
		gameMaxSpeedKPH: 100,
		model: "boxville",
		hash: 2307837162,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Boxville",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 71.25,
		gameMaxSpeedKPH: 100,
		model: "boxville2",
		hash: 4061868990,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Boxville II",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 71.25,
		gameMaxSpeedKPH: 100,
		model: "boxville3",
		hash: 121658888,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Tipper II",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 73,
		gameMaxSpeedKPH: 100,
		model: "tiptruck2",
		hash: 3347205726,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Taco Van",
		manufacturer: "Brute",
		price: 45000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 71,
		gameMaxSpeedKPH: 100,
		model: "taco",
		hash: 1951180813,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Pony",
		manufacturer: "Brute",
		price: 85000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.5,
		gameMaxSpeedKPH: 130,
		model: "pony",
		hash: 4175309224,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Pony II",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.5,
		gameMaxSpeedKPH: 130,
		model: "pony2",
		hash: 943752001,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Camper",
		manufacturer: "Brute",
		price: 150000,
		weightKG: 4000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 72.75,
		gameMaxSpeedKPH: 100,
		model: "camper",
		hash: 1876516712,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Boxville (Armored)",
		manufacturer: "Brute",
		price: 1463000,
		weightKG: 7500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 87,
		gameMaxSpeedKPH: 120,
		model: "boxville5",
		hash: 682434785,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.3499999940395355,
		maxTraction: 2.174999952316284,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Boxville (Post OP)",
		manufacturer: "Brute",
		price: 29925,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 71.25,
		gameMaxSpeedKPH: 100,
		model: "boxville4",
		hash: 444171386,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Utility Truck (Cherry Picker)",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 7500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 77,
		gameMaxSpeedKPH: 115,
		model: "utillitruck",
		hash: 516990260,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Utility Truck",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 77,
		gameMaxSpeedKPH: 115,
		model: "utillitruck2",
		hash: 887537515,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Tour Bus",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 65,
		gameMaxSpeedKPH: 110,
		model: "tourbus",
		hash: 1941029835,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Rental Shuttle Bus",
		manufacturer: "Brute",
		price: 15000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 65,
		gameMaxSpeedKPH: 110,
		model: "rentalbus",
		hash: 3196165219,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.25,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Dashound",
		manufacturer: "Brute",
		price: 262500,
		weightKG: 8500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 71.75,
		gameMaxSpeedKPH: 100,
		model: "coach",
		hash: 2222034228,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Bus",
		manufacturer: "Brute",
		price: 250000,
		weightKG: 9000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 65,
		gameMaxSpeedKPH: 100,
		model: "bus",
		hash: 3581397346,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 16,
		maxPassengers: 15,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.3499999940395355,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Airport Bus",
		manufacturer: "Brute",
		price: 275000,
		weightKG: 9000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 65,
		gameMaxSpeedKPH: 100,
		model: "airbus",
		hash: 1283517198,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 16,
		maxPassengers: 15,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Tipper",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 70.5,
		gameMaxSpeedKPH: 100,
		model: "tiptruck",
		hash: 48339065,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Police Riot",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 86.5,
		gameMaxSpeedKPH: 120,
		model: "riot",
		hash: 3089277354,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Ambulance",
		manufacturer: "Brute",
		price: 100000,
		weightKG: 2500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 97.75,
		gameMaxSpeedKPH: 140,
		model: "ambulance",
		hash: 1171614426,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Stockade",
		manufacturer: "Brute",
		price: 1120000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 83.5,
		gameMaxSpeedKPH: 120,
		model: "stockade",
		hash: 1747439474,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Stockade II",
		manufacturer: "Brute",
		price: 1120000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 83.5,
		gameMaxSpeedKPH: 120,
		model: "stockade3",
		hash: 4080511798,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Pyro",
		manufacturer: "Buckingham",
		price: 2227750,
		weightKG: 4000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 222.75,
		gameMaxSpeedKPH: 328.6,
		model: "pyro",
		hash: 2908775872,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 100,
		maxBraking: 11.269999504089355,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 11.270000457763672
	},
	{
		displayName: "Howard NX-25",
		manufacturer: "Buckingham",
		price: 648375,
		weightKG: 450,
		drivetrain: "FWD",
		realMaxSpeedMPH: 203.75,
		gameMaxSpeedKPH: 184.4,
		model: "howard",
		hash: 3287439187,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 100,
		maxBraking: 20.579999923706055,
		maxTraction: 1.149999976158142,
		maxAcceleration: 20.579999923706055
	},
	{
		displayName: "Vestra",
		manufacturer: "Buckingham",
		price: 475000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 163.75,
		gameMaxSpeedKPH: 141,
		model: "vestra",
		hash: 1341619767,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 97.1397476196289,
		maxBraking: 8.758119583129883,
		maxTraction: 1.149999976158142,
		maxAcceleration: 9.016000747680664
	},
	{
		displayName: "Shamal",
		manufacturer: "Buckingham",
		price: 575000,
		weightKG: 6400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 159,
		gameMaxSpeedKPH: 326.2,
		model: "shamal",
		hash: 3080461301,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 90.61445617675781,
		maxBraking: 7.1929755210876465,
		maxTraction: 1.149999976158142,
		maxAcceleration: 7.938000202178955
	},
	{
		displayName: "Nimbus",
		manufacturer: "Buckingham",
		price: 950000,
		weightKG: 6500,
		drivetrain: "FWD",
		realMaxSpeedMPH: 165,
		gameMaxSpeedKPH: 328.2,
		model: "nimbus",
		hash: 2999939664,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 94.55620574951172,
		maxBraking: 7.691201686859131,
		maxTraction: 1.149999976158142,
		maxAcceleration: 8.133999824523926
	},
	{
		displayName: "MilJet",
		manufacturer: "Buckingham",
		price: 850000,
		weightKG: 6400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 161.25,
		gameMaxSpeedKPH: 140,
		model: "miljet",
		hash: 165154707,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 16,
		maxPassengers: 15,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 91.83216857910156,
		maxBraking: 7.46962833404541,
		maxTraction: 1.5,
		maxAcceleration: 8.133999824523926
	},
	{
		displayName: "Luxor Deluxe",
		manufacturer: "Buckingham",
		price: 5000000,
		weightKG: 6500,
		drivetrain: "FWD",
		realMaxSpeedMPH: 159.5,
		gameMaxSpeedKPH: 326.2,
		model: "luxor2",
		hash: 3080673438,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 91.22515106201172,
		maxBraking: 7.33085298538208,
		maxTraction: 1.149999976158142,
		maxAcceleration: 8.03600025177002
	},
	{
		displayName: "Luxor",
		manufacturer: "Buckingham",
		price: 812500,
		weightKG: 6400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 159,
		gameMaxSpeedKPH: 326.2,
		model: "luxor",
		hash: 621481054,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 90.61445617675781,
		maxBraking: 7.1929755210876465,
		maxTraction: 1.149999976158142,
		maxAcceleration: 7.938000202178955
	},
	{
		displayName: "Alpha-Z1",
		manufacturer: "Buckingham",
		price: 1060675,
		weightKG: 450,
		drivetrain: "FWD",
		realMaxSpeedMPH: 201.5,
		gameMaxSpeedKPH: 184.4,
		model: "alphaz1",
		hash: 2771347558,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 100,
		maxBraking: 20.579999923706055,
		maxTraction: 1.149999976158142,
		maxAcceleration: 20.579999923706055
	},
	{
		displayName: "Volatus",
		manufacturer: "Buckingham",
		price: 1147500,
		weightKG: 8000,
		drivetrain: null,
		realMaxSpeedMPH: 161.25,
		gameMaxSpeedKPH: 160,
		model: "volatus",
		hash: 2449479409,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 59.240413665771484,
		maxBraking: 3.193058490753174,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.390000343322754
	},
	{
		displayName: "Valkyrie",
		manufacturer: "Buckingham",
		price: 1895250,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 145,
		gameMaxSpeedKPH: 165,
		model: "valkyrie",
		hash: 2694714877,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 54.72616195678711,
		maxBraking: 2.8424768447875977,
		maxTraction: 1.600000023841858,
		maxAcceleration: 5.193999767303467
	},
	{
		displayName: "Valkyrie II",
		manufacturer: "Buckingham",
		price: 1895250,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 145,
		gameMaxSpeedKPH: 165,
		model: "valkyrie2",
		hash: 1543134283,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 54.72616195678711,
		maxBraking: 2.8424768447875977,
		maxTraction: 1.600000023841858,
		maxAcceleration: 5.193999767303467
	},
	{
		displayName: "Swift Deluxe",
		manufacturer: "Buckingham",
		price: 2575000,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 157.75,
		gameMaxSpeedKPH: 160,
		model: "swift2",
		hash: 1075432268,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 58.8757209777832,
		maxBraking: 3.25994873046875,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.5370001792907715
	},
	{
		displayName: "Swift",
		manufacturer: "Buckingham",
		price: 750000,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 156.5,
		gameMaxSpeedKPH: 160,
		model: "swift",
		hash: 3955379698,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 58.23143768310547,
		maxBraking: 3.167207956314087,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.439000129699707
	},
	{
		displayName: "SuperVolito Carbon",
		manufacturer: "Buckingham",
		price: 1665000,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 148.75,
		gameMaxSpeedKPH: 160,
		model: "supervolito2",
		hash: 2623428164,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 61.96861267089844,
		maxBraking: 3.491931438446045,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.635000228881836
	},
	{
		displayName: "SuperVolito",
		manufacturer: "Buckingham",
		price: 1056500,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 148.75,
		gameMaxSpeedKPH: 160,
		model: "supervolito",
		hash: 710198397,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 61.96861267089844,
		maxBraking: 3.491931438446045,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.635000228881836
	},
	{
		displayName: "Police Maverick",
		manufacturer: "Buckingham",
		price: 100000,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 144,
		gameMaxSpeedKPH: 160,
		model: "polmav",
		hash: 353883353,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 56.596221923828125,
		maxBraking: 2.9396073818206787,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.193999767303467
	},
	{
		displayName: "Maverick",
		manufacturer: "Buckingham",
		price: 390000,
		weightKG: 6500,
		drivetrain: null,
		realMaxSpeedMPH: 140.25,
		gameMaxSpeedKPH: 160,
		model: "maverick",
		hash: 2634305738,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 54.067535400390625,
		maxBraking: 2.7552812099456787,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.095999717712402
	},
	{
		displayName: "Tug",
		manufacturer: "Buckingham",
		price: 625000,
		weightKG: 12200,
		drivetrain: null,
		realMaxSpeedMPH: 18.5,
		gameMaxSpeedKPH: 18,
		model: "tug",
		hash: 2194326579,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 5,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 2.200000047683716
	},
	{
		displayName: "Freecrawler",
		manufacturer: "Canis",
		price: 298500,
		weightKG: 2000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99.75,
		gameMaxSpeedKPH: 135,
		model: "freecrawler",
		hash: 4240635011,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Kamacho",
		manufacturer: "Canis",
		price: 172500,
		weightKG: 2350,
		drivetrain: "AWD",
		realMaxSpeedMPH: 116.75,
		gameMaxSpeedKPH: 134,
		model: "kamacho",
		hash: 4173521127,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.222225189208984,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.2549999952316284
	},
	{
		displayName: "Seminole",
		manufacturer: "Canis",
		price: 15000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 97.5,
		gameMaxSpeedKPH: 130,
		model: "seminole",
		hash: 1221512915,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.800000011920929,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Mesa",
		manufacturer: "Canis",
		price: 75000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 95,
		gameMaxSpeedKPH: 130,
		model: "mesa",
		hash: 914654722,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Mesa II",
		manufacturer: "Canis",
		price: 100000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 95,
		gameMaxSpeedKPH: 130,
		model: "mesa2",
		hash: 3546958660,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Mesa (Merryweather)",
		manufacturer: "Canis",
		price: 43500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99.75,
		gameMaxSpeedKPH: 130,
		model: "mesa3",
		hash: 2230595153,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Kalahari",
		manufacturer: "Canis",
		price: 20000,
		weightKG: 800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 120,
		model: "kalahari",
		hash: 92612664,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 1,
		maxTraction: 1.7799999713897705,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Bodhi",
		manufacturer: "Canis",
		price: 12500,
		weightKG: 2600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 134,
		model: "bodhi2",
		hash: 2859047862,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.222225189208984,
		maxBraking: 1.100000023841858,
		maxTraction: 2.25,
		maxAcceleration: 0.2150000035762787
	},
	{
		displayName: "Crusader",
		manufacturer: "Canis",
		price: 112500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 91.25,
		gameMaxSpeedKPH: 130,
		model: "crusader",
		hash: 321739290,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Romero Hearse",
		manufacturer: "Chariot",
		price: 22500,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 89.5,
		gameMaxSpeedKPH: 125,
		model: "romero",
		hash: 627094268,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.5,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Taipan",
		manufacturer: "Cheval",
		price: 990000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.25,
		gameMaxSpeedKPH: 170.25,
		model: "taipan",
		hash: 3160260734,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 47.29166793823242,
		maxBraking: 1,
		maxTraction: 13.779999732971191,
		maxAcceleration: 0.3569999933242798
	},
	{
		displayName: "Surge",
		manufacturer: "Cheval",
		price: 19000,
		weightKG: 1800,
		drivetrain: "FWD",
		realMaxSpeedMPH: 93.5,
		gameMaxSpeedKPH: 140,
		model: "surge",
		hash: 2400073108,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Fugitive",
		manufacturer: "Cheval",
		price: 12000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.75,
		gameMaxSpeedKPH: 145,
		model: "fugitive",
		hash: 1909141499,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Marshall",
		manufacturer: "Cheval",
		price: 250000,
		weightKG: 4000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 80.25,
		gameMaxSpeedKPH: 110,
		model: "marshall",
		hash: 1233534620,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.25,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "Picador",
		manufacturer: "Cheval",
		price: 4500,
		weightKG: 1600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 102.5,
		gameMaxSpeedKPH: 135,
		model: "picador",
		hash: 1507916787,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.800000011920929,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Raiden",
		manufacturer: "Coil",
		price: 687500,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 113.25,
		gameMaxSpeedKPH: 156.25,
		model: "raiden",
		hash: 2765724541,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.40277862548828,
		maxBraking: 1.2999999523162842,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.24500000476837158
	},
	{
		displayName: "Cyclone",
		manufacturer: "Coil",
		price: 945000,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 116.25,
		gameMaxSpeedKPH: 158,
		model: "cyclone",
		hash: 1392481335,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.25,
		maxAcceleration: 0.27250000834465027
	},
	{
		displayName: "Voltic",
		manufacturer: "Coil",
		price: 75000,
		weightKG: 1030,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106,
		gameMaxSpeedKPH: 145,
		model: "voltic",
		hash: 2672523198,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1,
		maxTraction: 2.5299999713897705,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Rocket Voltic",
		manufacturer: "Coil",
		price: 1915200,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.5,
		gameMaxSpeedKPH: 145,
		model: "voltic2",
		hash: 989294410,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1,
		maxTraction: 2.5299999713897705,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Brawler",
		manufacturer: "Coil",
		price: 357500,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 140,
		model: "brawler",
		hash: 2815302597,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8799999952316284,
		maxTraction: 1.9199999570846558,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Drift Yosemite",
		manufacturer: "Declasse",
		price: 654000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 140,
		model: "yosemite2",
		hash: 1693751655,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.625,
		maxAcceleration: 0.39500001072883606
	},
	{
		displayName: "Bugstars Burrito",
		manufacturer: "Declasse",
		price: 299250,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "burrito2",
		hash: 3387490166,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Nightmare Impaler",
		manufacturer: "Declasse",
		price: 604750,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 130,
		gameMaxSpeedKPH: 155,
		model: "impaler4",
		hash: 2550461639,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.699999988079071,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.3799999952316284
	},
	{
		displayName: "Nightmare Brutus",
		manufacturer: "Declasse",
		price: 1333325,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 140,
		model: "brutus3",
		hash: 2038858402,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Future Shock Impaler",
		manufacturer: "Declasse",
		price: 604750,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 130,
		gameMaxSpeedKPH: 155,
		model: "impaler3",
		hash: 2370166601,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.699999988079071,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.3799999952316284
	},
	{
		displayName: "Future Shock Brutus",
		manufacturer: "Declasse",
		price: 1333325,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 140,
		model: "brutus2",
		hash: 2403970600,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Tornado Mariachi",
		manufacturer: "Declasse",
		price: 300000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 91.25,
		gameMaxSpeedKPH: 130,
		model: "tornado4",
		hash: 2261744861,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Lost Gang Burrito",
		manufacturer: "Declasse",
		price: 40000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.25,
		gameMaxSpeedKPH: 130,
		model: "gburrito",
		hash: 2549763894,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Vamos",
		manufacturer: "Declasse",
		price: 298000,
		weightKG: 1380,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.25,
		gameMaxSpeedKPH: 145,
		model: "vamos",
		hash: 4245851645,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Tulip",
		manufacturer: "Declasse",
		price: 359000,
		weightKG: 1545,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.75,
		gameMaxSpeedKPH: 147.5,
		model: "tulip",
		hash: 1456744817,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.972225189208984,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Apocalypse Brutus",
		manufacturer: "Declasse",
		price: 1333325,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 140,
		model: "brutus",
		hash: 2139203625,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Apocalypse Impaler",
		manufacturer: "Declasse",
		price: 604750,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 130,
		gameMaxSpeedKPH: 155,
		model: "impaler2",
		hash: 1009171724,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.699999988079071,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.3799999952316284
	},
	{
		displayName: "Impaler",
		manufacturer: "Declasse",
		price: 165917.5,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 115.5,
		gameMaxSpeedKPH: 151,
		model: "impaler",
		hash: 2198276962,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.9444465637207,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Scramjet",
		manufacturer: "Declasse",
		price: 2314200,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 137,
		gameMaxSpeedKPH: 160,
		model: "scramjet",
		hash: 3656405053,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 0.949999988079071,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "Hotring Sabre",
		manufacturer: "Declasse",
		price: 415000,
		weightKG: 1508,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 159,
		model: "hotring",
		hash: 1115909093,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 0.699999988079071,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Yosemite",
		manufacturer: "Declasse",
		price: 242500,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 137,
		model: "yosemite",
		hash: 1871995513,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.75,
		maxTraction: 2.375,
		maxAcceleration: 0.2849999964237213
	},
	{
		displayName: "Police Rancher",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 89.5,
		gameMaxSpeedKPH: 130,
		model: "policeold1",
		hash: 2758042359,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.800000011920929,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Gang Burrito",
		manufacturer: "Declasse",
		price: 43225,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.25,
		gameMaxSpeedKPH: 130,
		model: "gburrito2",
		hash: 296357396,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Burrito",
		manufacturer: "Declasse",
		price: 90000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "burrito",
		hash: 2948279460,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Burrito II",
		manufacturer: "Declasse",
		price: 90000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "burrito3",
		hash: 2551651283,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Burrito III",
		manufacturer: "Declasse",
		price: 90000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "burrito4",
		hash: 893081117,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Burrito IV",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "burrito5",
		hash: 1132262048,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Granger",
		manufacturer: "Declasse",
		price: 17500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 101.5,
		gameMaxSpeedKPH: 140,
		model: "granger",
		hash: 2519238556,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Tornado Rat Rod",
		manufacturer: "Declasse",
		price: 189000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 130,
		model: "tornado6",
		hash: 2736567667,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 2,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Tornado Custom",
		manufacturer: "Declasse",
		price: 187500,
		weightKG: 2200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "tornado5",
		hash: 2497353967,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.2549999952316284,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.16099999845027924
	},
	{
		displayName: "Tornado Convertible",
		manufacturer: "Declasse",
		price: 200000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "tornado2",
		hash: 1531094468,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Tornado",
		manufacturer: "Declasse",
		price: 15000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "tornado",
		hash: 464687292,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Tornado Rusty",
		manufacturer: "Declasse",
		price: 15000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "tornado3",
		hash: 1762279763,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Mamba",
		manufacturer: "Declasse",
		price: 497500,
		weightKG: 1160,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 148,
		model: "mamba",
		hash: 2634021974,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 0.5,
		maxTraction: 2.5,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Drift Tampa",
		manufacturer: "Declasse",
		price: 497500,
		weightKG: 1100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 150,
		model: "tampa2",
		hash: 3223586949,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Premier",
		manufacturer: "Declasse",
		price: 5000,
		weightKG: 1600,
		drivetrain: "FWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 145,
		model: "premier",
		hash: 2411098011,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Asea",
		manufacturer: "Declasse",
		price: 6000,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 145,
		model: "asea",
		hash: 2485144969,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.4000000059604645,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Asea II",
		manufacturer: "Declasse",
		price: 6000,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 145,
		model: "asea2",
		hash: 2487343317,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.4000000059604645,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Rancher XL",
		manufacturer: "Declasse",
		price: 4500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 96,
		gameMaxSpeedKPH: 130,
		model: "rancherxl",
		hash: 1645267888,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.800000011920929,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Voodoo Custom",
		manufacturer: "Declasse",
		price: 210000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 100.75,
		gameMaxSpeedKPH: 130,
		model: "voodoo",
		hash: 2006667053,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.699999988079071,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Voodoo",
		manufacturer: "Declasse",
		price: 2750,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 99,
		gameMaxSpeedKPH: 130,
		model: "voodoo2",
		hash: 523724515,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Vigero",
		manufacturer: "Declasse",
		price: 10500,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 140,
		model: "vigero",
		hash: 3469130167,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Weaponized Tampa",
		manufacturer: "Declasse",
		price: 1054025,
		weightKG: 1400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 112.25,
		gameMaxSpeedKPH: 145,
		model: "tampa3",
		hash: 3084515313,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Tampa",
		manufacturer: "Declasse",
		price: 187500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.5,
		gameMaxSpeedKPH: 140,
		model: "tampa",
		hash: 972671128,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Burger Shot Stallion",
		manufacturer: "Declasse",
		price: 138500,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.25,
		gameMaxSpeedKPH: 144,
		model: "stalion2",
		hash: 3893323758,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40,
		maxBraking: 0.699999988079071,
		maxTraction: 2.25,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Stallion",
		manufacturer: "Declasse",
		price: 35500,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.25,
		gameMaxSpeedKPH: 144,
		model: "stalion",
		hash: 1923400478,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40,
		maxBraking: 0.699999988079071,
		maxTraction: 2.25,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Sabre Turbo Custom",
		manufacturer: "Declasse",
		price: 245000,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 140,
		model: "sabregt2",
		hash: 223258115,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8199999928474426,
		maxTraction: 2.259999990463257,
		maxAcceleration: 0.28200000524520874
	},
	{
		displayName: "Sabre Turbo",
		manufacturer: "Declasse",
		price: 7500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.75,
		gameMaxSpeedKPH: 140,
		model: "sabregt",
		hash: 2609945748,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Moonbeam Custom",
		manufacturer: "Declasse",
		price: 185000,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 125,
		model: "moonbeam2",
		hash: 1896491931,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Moonbeam",
		manufacturer: "Declasse",
		price: 16250,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 125,
		model: "moonbeam",
		hash: 525509695,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Sheriff SUV",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 96,
		gameMaxSpeedKPH: 140,
		model: "sheriff2",
		hash: 1922257928,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Police Transporter",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 90.75,
		gameMaxSpeedKPH: 130,
		model: "policet",
		hash: 456714581,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Park Ranger",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 96,
		gameMaxSpeedKPH: 135,
		model: "pranger",
		hash: 741586030,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Lifeguard Granger",
		manufacturer: "Declasse",
		price: 432500,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 95.25,
		gameMaxSpeedKPH: 140,
		model: "lguard",
		hash: 469291905,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "FIB (SUV)",
		manufacturer: "Declasse",
		price: 100000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 96,
		gameMaxSpeedKPH: 140,
		model: "fbi2",
		hash: 2647026068,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Rhapsody",
		manufacturer: "Declasse",
		price: 70000,
		weightKG: 1350,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102.25,
		gameMaxSpeedKPH: 133,
		model: "rhapsody",
		hash: 841808271,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.9444465637207,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "JB 700W",
		manufacturer: "Dewbauchee",
		price: 735000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 150,
		model: "jb7002",
		hash: 394110044,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Rapid GT Classic",
		manufacturer: "Dewbauchee",
		price: 442500,
		weightKG: 1570,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.75,
		gameMaxSpeedKPH: 149.5,
		model: "rapidgt3",
		hash: 2049897956,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.52777862548828,
		maxBraking: 0.5,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Vagner",
		manufacturer: "Dewbauchee",
		price: 767500,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.75,
		gameMaxSpeedKPH: 160.9,
		model: "vagner",
		hash: 1939284556,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.6944465637207,
		maxBraking: 1.1200000047683716,
		maxTraction: 3.0256502628326416,
		maxAcceleration: 0.3700000047683716
	},
	{
		displayName: "JB 700",
		manufacturer: "Dewbauchee",
		price: 175000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 150,
		model: "jb700",
		hash: 1051415893,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Specter Custom",
		manufacturer: "Dewbauchee",
		price: 126000,
		weightKG: 1450,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 155.2,
		model: "specter2",
		hash: 1074745671,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.11111068725586,
		maxBraking: 1.100000023841858,
		maxTraction: 2.8335375785827637,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Specter",
		manufacturer: "Dewbauchee",
		price: 299500,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 155,
		model: "specter",
		hash: 1886268224,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1,
		maxTraction: 2.619999885559082,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Seven-70",
		manufacturer: "Dewbauchee",
		price: 347500,
		weightKG: 1650,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 159,
		model: "seven70",
		hash: 2537130571,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1,
		maxTraction: 2.559999942779541,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Rapid GT Sports",
		manufacturer: "Dewbauchee",
		price: 70000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 152,
		model: "rapidgt2",
		hash: 1737773231,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Rapid GT",
		manufacturer: "Dewbauchee",
		price: 66000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 152,
		model: "rapidgt",
		hash: 2360515092,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Massacro (Racecar)",
		manufacturer: "Dewbauchee",
		price: 192500,
		weightKG: 1700,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 156.199997,
		model: "massacro2",
		hash: 3663206819,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.38888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.430000066757202,
		maxAcceleration: 0.36399999260902405
	},
	{
		displayName: "Massacro",
		manufacturer: "Dewbauchee",
		price: 137500,
		weightKG: 1700,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 156.199997,
		model: "massacro",
		hash: 4152024626,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.38888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.4200000762939453,
		maxAcceleration: 0.36399999260902405
	},
	{
		displayName: "Exemplar",
		manufacturer: "Dewbauchee",
		price: 600000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.25,
		gameMaxSpeedKPH: 145,
		model: "exemplar",
		hash: 4289813342,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Blista Kanjo",
		manufacturer: "Dinka",
		price: 290000,
		weightKG: 1150,
		drivetrain: "FWD",
		realMaxSpeedMPH: 109.25,
		gameMaxSpeedKPH: 140,
		model: "kanjo",
		hash: 409049982,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.5,
		maxTraction: 1.9700000286102295,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Sugoi",
		manufacturer: "Dinka",
		price: 612000,
		weightKG: 1380,
		drivetrain: "FWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 156,
		model: "sugoi",
		hash: 987469656,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.333335876464844,
		maxBraking: 0.8500000238418579,
		maxTraction: 12.076499938964844,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Jester Classic",
		manufacturer: "Dinka",
		price: 395000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.75,
		gameMaxSpeedKPH: 156,
		model: "jester3",
		hash: 4080061290,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.333335876464844,
		maxBraking: 0.949999988079071,
		maxTraction: 2.575000047683716,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Jester (Racecar)",
		manufacturer: "Dinka",
		price: 175000,
		weightKG: 1300,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 158,
		model: "jester2",
		hash: 3188613414,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.949999988079071,
		maxTraction: 2.569999933242798,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Jester",
		manufacturer: "Dinka",
		price: 120000,
		weightKG: 1300,
		drivetrain: "AWD",
		realMaxSpeedMPH: 118.75,
		gameMaxSpeedKPH: 158,
		model: "jester",
		hash: 2997294755,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.949999988079071,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Go Go Monkey Blista",
		manufacturer: "Dinka",
		price: 100000,
		weightKG: 1050,
		drivetrain: "FWD",
		realMaxSpeedMPH: 103,
		gameMaxSpeedKPH: 132,
		model: "blista3",
		hash: 3703315515,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.66666793823242,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "Blista Compact",
		manufacturer: "Dinka",
		price: 21000,
		weightKG: 1050,
		drivetrain: "FWD",
		realMaxSpeedMPH: 103,
		gameMaxSpeedKPH: 132,
		model: "blista2",
		hash: 1039032026,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.66666793823242,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "Vindicator",
		manufacturer: "Dinka",
		price: 315000,
		weightKG: 280,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 148,
		model: "vindicator",
		hash: 2941886209,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.5199999809265137,
		maxTraction: 1.9800000190734863,
		maxAcceleration: 0.2630000114440918
	},
	{
		displayName: "Thrust",
		manufacturer: "Dinka",
		price: 37500,
		weightKG: 270,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118.25,
		gameMaxSpeedKPH: 152,
		model: "thrust",
		hash: 1836027715,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1.5,
		maxTraction: 1.9800000190734863,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Enduro",
		manufacturer: "Dinka",
		price: 24000,
		weightKG: 220,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.25,
		gameMaxSpeedKPH: 119,
		model: "enduro",
		hash: 1753414259,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.05555725097656,
		maxBraking: 1.0499999523162842,
		maxTraction: 2.1600000858306885,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Double-T",
		manufacturer: "Dinka",
		price: 6000,
		weightKG: 200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 147,
		model: "double",
		hash: 2623969160,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1.399999976158142,
		maxTraction: 2.180000066757202,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Akuma",
		manufacturer: "Dinka",
		price: 4500,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 145,
		model: "akuma",
		hash: 1672195559,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "Blista",
		manufacturer: "Dinka",
		price: 8000,
		weightKG: 1200,
		drivetrain: "FWD",
		realMaxSpeedMPH: 104.5,
		gameMaxSpeedKPH: 135,
		model: "blista",
		hash: 3950024287,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "Marquis",
		manufacturer: "Dinka",
		price: 206995,
		weightKG: 12200,
		drivetrain: null,
		realMaxSpeedMPH: 26.25,
		gameMaxSpeedKPH: 30,
		model: "marquis",
		hash: 3251507587,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 8.333333969116211,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 2.5
	},
	{
		displayName: "Landstalker",
		manufacturer: "Dundreary",
		price: 29000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99.25,
		gameMaxSpeedKPH: 135,
		model: "landstalker",
		hash: 1269098716,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.800000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Stretch",
		manufacturer: "Dundreary",
		price: 15000,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 94.25,
		gameMaxSpeedKPH: 135,
		model: "stretch",
		hash: 2333339779,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.800000011920929,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Regina",
		manufacturer: "Dundreary",
		price: 4000,
		weightKG: 1900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 86.25,
		gameMaxSpeedKPH: 120,
		model: "regina",
		hash: 4280472072,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Virgo Classic Custom",
		manufacturer: "Dundreary",
		price: 120000,
		weightKG: 2300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 104,
		gameMaxSpeedKPH: 134,
		model: "virgo2",
		hash: 3395457658,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.222225189208984,
		maxBraking: 0.7200000286102295,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.210999995470047
	},
	{
		displayName: "Virgo Classic",
		manufacturer: "Dundreary",
		price: 82500,
		weightKG: 2200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 96.75,
		gameMaxSpeedKPH: 134,
		model: "virgo3",
		hash: 16646064,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.222225189208984,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Habanero",
		manufacturer: "Emperor",
		price: 21000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 137,
		model: "habanero",
		hash: 884422927,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.25,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "ETR1",
		manufacturer: "Emperor",
		price: 997500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.75,
		gameMaxSpeedKPH: 158.5,
		model: "sheava",
		hash: 819197656,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.02777862548828,
		maxBraking: 1,
		maxTraction: 2.9282500743865967,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Paragon R (Armored)",
		manufacturer: "Enus",
		price: 100000,
		weightKG: 2555,
		drivetrain: "AWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 160,
		model: "paragon2",
		hash: 1416466158,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 0.949999988079071,
		maxTraction: 2.674999952316284,
		maxAcceleration: 0.32749998569488525
	},
	{
		displayName: "Paragon R",
		manufacturer: "Enus",
		price: 452500,
		weightKG: 2415,
		drivetrain: "AWD",
		realMaxSpeedMPH: 123.25,
		gameMaxSpeedKPH: 159.9,
		model: "paragon",
		hash: 3847255899,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.41666793823242,
		maxBraking: 1,
		maxTraction: 2.674999952316284,
		maxAcceleration: 0.32899999618530273
	},
	{
		displayName: "Stafford",
		manufacturer: "Enus",
		price: 636000,
		weightKG: 2110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 93.5,
		gameMaxSpeedKPH: 120,
		model: "stafford",
		hash: 321186144,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.44999998807907104,
		maxTraction: 2,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Huntley S",
		manufacturer: "Enus",
		price: 97500,
		weightKG: 2500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 136,
		model: "huntley",
		hash: 486987393,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.77777862548828,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Super Diamond",
		manufacturer: "Enus",
		price: 125000,
		weightKG: 2800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 111.75,
		gameMaxSpeedKPH: 145,
		model: "superd",
		hash: 1123216662,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Cognoscenti 55 (Armored)",
		manufacturer: "Enus",
		price: 198000,
		weightKG: 2600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.25,
		gameMaxSpeedKPH: 145,
		model: "cog552",
		hash: 704435172,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.550000011920929,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Cognoscenti 55",
		manufacturer: "Enus",
		price: 77000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.5,
		gameMaxSpeedKPH: 145,
		model: "cog55",
		hash: 906642318,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.5699999928474426,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Cognoscenti (Armored)",
		manufacturer: "Enus",
		price: 279000,
		weightKG: 2800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.75,
		gameMaxSpeedKPH: 140,
		model: "cognoscenti2",
		hash: 3690124666,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.5199999809265137,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.2549999952316284
	},
	{
		displayName: "Cognoscenti",
		manufacturer: "Enus",
		price: 127000,
		weightKG: 2700,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110,
		gameMaxSpeedKPH: 140,
		model: "cognoscenti",
		hash: 2264796000,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.550000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Windsor Drop",
		manufacturer: "Enus",
		price: 1000000,
		weightKG: 3000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 150,
		model: "windsor2",
		hash: 2364918497,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.699999988079071,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.27900001406669617
	},
	{
		displayName: "Windsor",
		manufacturer: "Enus",
		price: 890000,
		weightKG: 2800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 150,
		model: "windsor",
		hash: 1581459400,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.699999988079071,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Cognoscenti Cabrio",
		manufacturer: "Enus",
		price: 92500,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110,
		gameMaxSpeedKPH: 145,
		model: "cogcabrio",
		hash: 330661258,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "FQ 2",
		manufacturer: "Fathom",
		price: 25000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104,
		gameMaxSpeedKPH: 135,
		model: "fq2",
		hash: 3157435195,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.25,
		maxTraction: 2,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Baller LE LWB (Armored)",
		manufacturer: "Gallivanter",
		price: 256500,
		weightKG: 2550,
		drivetrain: "AWD",
		realMaxSpeedMPH: 107.75,
		gameMaxSpeedKPH: 135,
		model: "baller6",
		hash: 666166960,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.550000011920929,
		maxTraction: 2,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Baller LE LWB",
		manufacturer: "Gallivanter",
		price: 123500,
		weightKG: 2450,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 135,
		model: "baller4",
		hash: 634118882,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.5699999928474426,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Baller LE (Armored)",
		manufacturer: "Gallivanter",
		price: 187000,
		weightKG: 2275,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 135,
		model: "baller5",
		hash: 470404958,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.5799999833106995,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Baller LE",
		manufacturer: "Gallivanter",
		price: 74500,
		weightKG: 2175,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.75,
		gameMaxSpeedKPH: 135,
		model: "baller3",
		hash: 1878062887,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.2750000059604645
	},
	{
		displayName: "Baller II",
		manufacturer: "Gallivanter",
		price: 90000,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.25,
		gameMaxSpeedKPH: 135,
		model: "baller2",
		hash: 142944341,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Baller",
		manufacturer: "Gallivanter",
		price: 90000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 130,
		model: "baller",
		hash: 3486135912,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Furia",
		manufacturer: "Grotti",
		price: 1370000,
		weightKG: 1898,
		drivetrain: "AWD",
		realMaxSpeedMPH: 122,
		gameMaxSpeedKPH: 161.2,
		model: "furia",
		hash: 960812448,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.77777862548828,
		maxBraking: 1,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Itali GTO",
		manufacturer: "Grotti",
		price: 982500,
		weightKG: 1520,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127.75,
		gameMaxSpeedKPH: 161.2,
		model: "italigto",
		hash: 3963499524,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.77777862548828,
		maxBraking: 1.100000023841858,
		maxTraction: 2.619999885559082,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "GT500",
		manufacturer: "Grotti",
		price: 392500,
		weightKG: 800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.75,
		gameMaxSpeedKPH: 140.2,
		model: "gt500",
		hash: 2215179066,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.9444465637207,
		maxBraking: 0.7699999809265137,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Vigilante",
		manufacturer: "Grotti",
		price: 1875000,
		weightKG: 7500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 147,
		gameMaxSpeedKPH: 160.02,
		model: "vigilante",
		hash: 3052358707,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 44.45000457763672,
		maxBraking: 1.0199999809265137,
		maxTraction: 2.7750000953674316,
		maxAcceleration: 0.375
	},
	{
		displayName: "X80 Proto",
		manufacturer: "Grotti",
		price: 1350000,
		weightKG: 900,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127.5,
		gameMaxSpeedKPH: 161,
		model: "prototipo",
		hash: 2123327359,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.722225189208984,
		maxBraking: 1.100000023841858,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.375
	},
	{
		displayName: "Visione",
		manufacturer: "Grotti",
		price: 1125000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125.25,
		gameMaxSpeedKPH: 160,
		model: "visione",
		hash: 3296789504,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 1.0199999809265137,
		maxTraction: 2.942500114440918,
		maxAcceleration: 0.35499998927116394
	},
	{
		displayName: "Turismo R",
		manufacturer: "Grotti",
		price: 250000,
		weightKG: 1350,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 155,
		model: "turismor",
		hash: 408192225,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.640000104904175,
		maxAcceleration: 0.3529999852180481
	},
	{
		displayName: "Cheetah",
		manufacturer: "Grotti",
		price: 325000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.25,
		gameMaxSpeedKPH: 153,
		model: "cheetah",
		hash: 2983812512,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.500003814697266,
		maxBraking: 0.800000011920929,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Turismo Classic",
		manufacturer: "Grotti",
		price: 352500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.75,
		gameMaxSpeedKPH: 152.5,
		model: "turismo2",
		hash: 3312836369,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.361114501953125,
		maxBraking: 0.5,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Stinger GT",
		manufacturer: "Grotti",
		price: 437500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 145,
		model: "stingergt",
		hash: 2196019706,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Stinger",
		manufacturer: "Grotti",
		price: 425000,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 145,
		model: "stinger",
		hash: 1545842587,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Cheetah Classic",
		manufacturer: "Grotti",
		price: 432500,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.25,
		gameMaxSpeedKPH: 152,
		model: "cheetah2",
		hash: 223240013,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Carbonizzare",
		manufacturer: "Grotti",
		price: 97500,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 158,
		model: "carbonizzare",
		hash: 2072687711,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.380000114440918,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Bestia GTS",
		manufacturer: "Grotti",
		price: 305000,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 118.75,
		gameMaxSpeedKPH: 155,
		model: "bestiagts",
		hash: 1274868363,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1,
		maxTraction: 2.4200000762939453,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Brioso R/A",
		manufacturer: "Grotti",
		price: 77500,
		weightKG: 850,
		drivetrain: "AWD",
		realMaxSpeedMPH: 103.75,
		gameMaxSpeedKPH: 135,
		model: "brioso",
		hash: 1549126457,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Ruston",
		manufacturer: "Hijak",
		price: 215000,
		weightKG: 800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 116.25,
		gameMaxSpeedKPH: 148,
		model: "ruston",
		hash: 719660200,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.7046496868133545,
		maxAcceleration: 0.32499998807907104
	},
	{
		displayName: "Khamelion",
		manufacturer: "Hijak",
		price: 50000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102.25,
		gameMaxSpeedKPH: 140,
		model: "khamelion",
		hash: 544021352,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Nightmare Scarab",
		manufacturer: "HVY",
		price: 1538145,
		weightKG: 5000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 100,
		model: "scarab3",
		hash: 3715219435,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.699999988079071,
		maxTraction: 2.25,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Future Shock Scarab",
		manufacturer: "HVY",
		price: 1538145,
		weightKG: 5000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 100,
		model: "scarab2",
		hash: 1542143200,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.699999988079071,
		maxTraction: 2.25,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Apocalypse Scarab",
		manufacturer: "HVY",
		price: 1538145,
		weightKG: 5000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 100,
		model: "scarab",
		hash: 3147997943,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.699999988079071,
		maxTraction: 2.25,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Menacer",
		manufacturer: "HVY",
		price: 887500,
		weightKG: 5600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 94.25,
		gameMaxSpeedKPH: 130,
		model: "menacer",
		hash: 2044532910,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Mixer II",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 84.5,
		gameMaxSpeedKPH: 110,
		model: "mixer2",
		hash: 475220373,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Chernobog",
		manufacturer: "HVY",
		price: 1655850,
		weightKG: 40000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 70.25,
		gameMaxSpeedKPH: 95,
		model: "chernobog",
		hash: 3602674979,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 26.38888931274414,
		maxBraking: 0.10000000149011612,
		maxTraction: 2,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Ripley",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 9500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 55.5,
		gameMaxSpeedKPH: 70,
		model: "ripley",
		hash: 3448987385,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 19.44444465637207,
		maxBraking: 0.20000000298023224,
		maxTraction: 1.350000023841858,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Forklift",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 35.5,
		gameMaxSpeedKPH: 30,
		model: "forklift",
		hash: 1491375716,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 8.333333969116211,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.149999976158142,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Docktug",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 10400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 56,
		gameMaxSpeedKPH: 80,
		model: "docktug",
		hash: 3410276810,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 22.22222328186035,
		maxBraking: 0.5,
		maxTraction: 1.399999976158142,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Airtug",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 29.25,
		gameMaxSpeedKPH: 40,
		model: "airtug",
		hash: 1560980623,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 11.111111640930176,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.149999976158142,
		maxAcceleration: 0.05999999865889549
	},
	{
		displayName: "Nightshark",
		manufacturer: "HVY",
		price: 622500,
		weightKG: 4400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 140,
		model: "nightshark",
		hash: 433954513,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.75,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Insurgent Pick-up Custom",
		manufacturer: "HVY",
		price: 101250,
		weightKG: 8600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99.25,
		gameMaxSpeedKPH: 130,
		model: "insurgent3",
		hash: 2370534026,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 9,
		maxPassengers: 8,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Insurgent Pick-up",
		manufacturer: "HVY",
		price: 897750,
		weightKG: 8600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 91.5,
		gameMaxSpeedKPH: 130,
		model: "insurgent",
		hash: 2434067162,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 9,
		maxPassengers: 8,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Insurgent",
		manufacturer: "HVY",
		price: 448875,
		weightKG: 8600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "insurgent2",
		hash: 2071877360,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Barracks Semi",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 10000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 110,
		model: "barracks2",
		hash: 1074326203,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 1,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "Barracks",
		manufacturer: "HVY",
		price: 225000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 110,
		model: "barracks",
		hash: 3471458123,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Barracks II",
		manufacturer: "HVY",
		price: 225000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 110,
		model: "barracks3",
		hash: 630371791,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "APC Tank",
		manufacturer: "HVY",
		price: 1546125,
		weightKG: 10600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 63,
		gameMaxSpeedKPH: 97,
		model: "apc",
		hash: 562680400,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 26.944446563720703,
		maxBraking: 0.20000000298023224,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Mixer",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 84.5,
		gameMaxSpeedKPH: 110,
		model: "mixer",
		hash: 3510150843,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Dump",
		manufacturer: "HVY",
		price: 500000,
		weightKG: 35000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 32,
		gameMaxSpeedKPH: 43,
		model: "dump",
		hash: 2164484578,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 11.94444465637207,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Dozer",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 20000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 11,
		gameMaxSpeedKPH: 15,
		model: "bulldozer",
		hash: 1886712733,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 4.1666669845581055,
		maxBraking: 0.20000000298023224,
		maxTraction: 1.100000023841858,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Dock Handler",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 6000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 31.75,
		gameMaxSpeedKPH: 25,
		model: "handler",
		hash: 444583674,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 6.94444465637207,
		maxBraking: 0.10000000149011612,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Cutter",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 25000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 30.25,
		gameMaxSpeedKPH: 40,
		model: "cutter",
		hash: 3288047904,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 11.111111640930176,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.6200000047683716,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Skylift",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 10000,
		drivetrain: null,
		realMaxSpeedMPH: 115,
		gameMaxSpeedKPH: 160,
		model: "skylift",
		hash: 1044954915,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 47.93147277832031,
		maxBraking: 2.2546963691711426,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.703999996185303
	},
	{
		displayName: "Biff",
		manufacturer: "HVY",
		price: 100000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 83.5,
		gameMaxSpeedKPH: 110,
		model: "biff",
		hash: 850991848,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Deluxo",
		manufacturer: "Imponte",
		price: 2360750,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 127.25,
		gameMaxSpeedKPH: 140,
		model: "deluxo",
		hash: 1483171323,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.22750000655651093
	},
	{
		displayName: "Ruiner 2000",
		manufacturer: "Imponte",
		price: 2872800,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119,
		gameMaxSpeedKPH: 152,
		model: "ruiner2",
		hash: 941494461,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Ruiner",
		manufacturer: "Imponte",
		price: 5000,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118.75,
		gameMaxSpeedKPH: 145,
		model: "ruiner",
		hash: 4067225593,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.800000011920929,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Ruiner II",
		manufacturer: "Imponte",
		price: 5000,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118.75,
		gameMaxSpeedKPH: 145,
		model: "ruiner3",
		hash: 777714999,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.800000011920929,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Phoenix",
		manufacturer: "Imponte",
		price: 170000,
		weightKG: 1700,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113,
		gameMaxSpeedKPH: 145,
		model: "phoenix",
		hash: 2199527893,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.800000011920929,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Nightshade",
		manufacturer: "Imponte",
		price: 292500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 104.5,
		gameMaxSpeedKPH: 145,
		model: "nightshade",
		hash: 2351681756,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.25,
		maxAcceleration: 0.25
	},
	{
		displayName: "Dukes",
		manufacturer: "Imponte",
		price: 31000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.5,
		gameMaxSpeedKPH: 144,
		model: "dukes",
		hash: 723973206,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Duke O'Death",
		manufacturer: "Imponte",
		price: 332500,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 152,
		model: "dukes2",
		hash: 3968823444,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.259999990463257,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Coquette Classic",
		manufacturer: "Invetero",
		price: 332500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 151,
		model: "coquette2",
		hash: 1011753235,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.9444465637207,
		maxBraking: 0.5,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Coquette",
		manufacturer: "Invetero",
		price: 69000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 152,
		model: "coquette",
		hash: 108773431,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Coquette BlackFin",
		manufacturer: "Invetero",
		price: 347500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 151,
		model: "coquette3",
		hash: 784565758,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.9444465637207,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.25,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Lawn Mower",
		manufacturer: "Jacksheepe",
		price: 100000,
		weightKG: 400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 14.75,
		gameMaxSpeedKPH: 20,
		model: "mower",
		hash: 1783355638,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 5.555555820465088,
		maxBraking: 0.5,
		maxTraction: 1.350000023841858,
		maxAcceleration: 0.05000000074505806
	},
	{
		displayName: "Trashmaster",
		manufacturer: "JoBuilt",
		price: 100000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 110,
		model: "trash",
		hash: 1917016601,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.12999999523162842
	},
	{
		displayName: "Trashmaster II",
		manufacturer: "JoBuilt",
		price: 100000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 110,
		model: "trash2",
		hash: 3039269212,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.12999999523162842
	},
	{
		displayName: "Velum 5-Seater",
		manufacturer: "JoBuilt",
		price: 661675,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 139.75,
		gameMaxSpeedKPH: 268.7,
		model: "velum2",
		hash: 1077420264,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 74.63624572753906,
		maxBraking: 4.169180393218994,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 5.585999965667725
	},
	{
		displayName: "Velum",
		manufacturer: "JoBuilt",
		price: 225000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 139.75,
		gameMaxSpeedKPH: 268.7,
		model: "velum",
		hash: 2621610858,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 74.63624572753906,
		maxBraking: 4.169180393218994,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 5.585999965667725
	},
	{
		displayName: "P-996 Lazer",
		manufacturer: "JoBuilt",
		price: 3250000,
		weightKG: 8000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 195,
		gameMaxSpeedKPH: 328.6,
		model: "lazer",
		hash: 3013282534,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 91.28709411621094,
		maxBraking: 17.892271041870117,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 19.600000381469727
	},
	{
		displayName: "Mammatus",
		manufacturer: "JoBuilt",
		price: 150000,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 132.25,
		gameMaxSpeedKPH: 250,
		model: "mammatus",
		hash: 2548391185,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 69.36756134033203,
		maxBraking: 3.39901065826416,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 4.900000095367432
	},
	{
		displayName: "Rubble",
		manufacturer: "JoBuilt",
		price: 100000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 77.5,
		gameMaxSpeedKPH: 100,
		model: "rubble",
		hash: 2589662668,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Phantom Wedge",
		manufacturer: "JoBuilt",
		price: 1276800,
		weightKG: 14000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.5,
		gameMaxSpeedKPH: 130,
		model: "phantom2",
		hash: 2645431192,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.8500000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Phantom Custom",
		manufacturer: "JoBuilt",
		price: 612500,
		weightKG: 12000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103.5,
		gameMaxSpeedKPH: 130,
		model: "phantom3",
		hash: 177270108,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Phantom",
		manufacturer: "JoBuilt",
		price: 250000,
		weightKG: 12000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 82.5,
		gameMaxSpeedKPH: 123,
		model: "phantom",
		hash: 2157618379,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.16666793823242,
		maxBraking: 0.800000011920929,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Hauler Custom",
		manufacturer: "JoBuilt",
		price: 700000,
		weightKG: 11000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 130,
		model: "hauler2",
		hash: 387748548,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.8500000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Hauler",
		manufacturer: "JoBuilt",
		price: 250000,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 73.25,
		gameMaxSpeedKPH: 115,
		model: "hauler",
		hash: 1518533038,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.800000011920929,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Sultan Classic",
		manufacturer: "Karin",
		price: 859000,
		weightKG: 1100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 116.5,
		gameMaxSpeedKPH: 145,
		model: "sultan2",
		hash: 872704284,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.5,
		maxTraction: 2.494999885559082,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Everon",
		manufacturer: "Karin",
		price: 737500,
		weightKG: 3250,
		drivetrain: "AWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 136,
		model: "everon",
		hash: 2538945576,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.77777862548828,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.29499998688697815
	},
	{
		displayName: "Dilettante (Patrol)",
		manufacturer: "Karin",
		price: 100000,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 88.5,
		gameMaxSpeedKPH: 130,
		model: "dilettante2",
		hash: 1682114128,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.7599999904632568,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "190z",
		manufacturer: "Karin",
		price: 450000,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.75,
		gameMaxSpeedKPH: 140,
		model: "z190",
		hash: 838982985,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.949999988079071,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "BeeJay XL",
		manufacturer: "Karin",
		price: 13500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 96.75,
		gameMaxSpeedKPH: 130,
		model: "bjxl",
		hash: 850565707,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.800000011920929,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Sultan RS",
		manufacturer: "Karin",
		price: 397500,
		weightKG: 1250,
		drivetrain: "AWD",
		realMaxSpeedMPH: 117.25,
		gameMaxSpeedKPH: 148,
		model: "sultanrs",
		hash: 3999278268,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1,
		maxTraction: 2.5,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Sultan",
		manufacturer: "Karin",
		price: 6000,
		weightKG: 1400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 115.75,
		gameMaxSpeedKPH: 145,
		model: "sultan",
		hash: 970598228,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.4000000059604645,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Kuruma (Armored)",
		manufacturer: "Karin",
		price: 349125,
		weightKG: 3200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 109.75,
		gameMaxSpeedKPH: 140,
		model: "kuruma2",
		hash: 410882957,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Kuruma",
		manufacturer: "Karin",
		price: 63175,
		weightKG: 1500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 143,
		model: "kuruma",
		hash: 2922118804,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.722225189208984,
		maxBraking: 0.5,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Futo",
		manufacturer: "Karin",
		price: 4500,
		weightKG: 900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.25,
		gameMaxSpeedKPH: 135,
		model: "futo",
		hash: 2016857647,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.5,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Intruder",
		manufacturer: "Karin",
		price: 8000,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106,
		gameMaxSpeedKPH: 145,
		model: "intruder",
		hash: 886934177,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Asterope",
		manufacturer: "Karin",
		price: 13000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105,
		gameMaxSpeedKPH: 145,
		model: "asterope",
		hash: 2391954683,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Technical Custom",
		manufacturer: "Karin",
		price: 71250,
		weightKG: 3200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 101.5,
		gameMaxSpeedKPH: 130,
		model: "technical3",
		hash: 1356124575,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.699999988079071,
		maxTraction: 2.130000114440918,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Technical Aqua",
		manufacturer: "Karin",
		price: 744800,
		weightKG: 3200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 93,
		gameMaxSpeedKPH: 130,
		model: "technical2",
		hash: 1180875963,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.699999988079071,
		maxTraction: 2.130000114440918,
		maxAcceleration: 0.25
	},
	{
		displayName: "Technical",
		manufacturer: "Karin",
		price: 631750,
		weightKG: 3200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 93,
		gameMaxSpeedKPH: 130,
		model: "technical",
		hash: 2198148358,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.699999988079071,
		maxTraction: 2.130000114440918,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Rusty Rebel",
		manufacturer: "Karin",
		price: 1500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 130,
		model: "rebel",
		hash: 3087195462,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Rebel",
		manufacturer: "Karin",
		price: 11000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 130,
		model: "rebel2",
		hash: 2249373259,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Dilettante",
		manufacturer: "Karin",
		price: 12500,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 88.5,
		gameMaxSpeedKPH: 130,
		model: "dilettante",
		hash: 3164157193,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.7599999904632568,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Kraken",
		manufacturer: "Kraken Submersibles",
		price: 662500,
		weightKG: 2800,
		drivetrain: null,
		realMaxSpeedMPH: 20.75,
		gameMaxSpeedKPH: 75,
		model: "submersible2",
		hash: 3228633070,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 20.83333396911621,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 10
	},
	{
		displayName: "Komoda",
		manufacturer: "Lampadati",
		price: 850000,
		weightKG: 1575,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123,
		gameMaxSpeedKPH: 156,
		model: "komoda",
		hash: 3460613305,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.333335876464844,
		maxBraking: 0.949999988079071,
		maxTraction: 2.690000057220459,
		maxAcceleration: 0.367000013589859
	},
	{
		displayName: "Novak",
		manufacturer: "Lampadati",
		price: 304000,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 126,
		gameMaxSpeedKPH: 153,
		model: "novak",
		hash: 2465530446,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.500003814697266,
		maxBraking: 0.800000011920929,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Michelli GT",
		manufacturer: "Lampadati",
		price: 612500,
		weightKG: 840,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 140,
		model: "michelli",
		hash: 1046206681,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.75,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.2824999988079071
	},
	{
		displayName: "Viseris",
		manufacturer: "Lampadati",
		price: 437500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 155.5,
		model: "viseris",
		hash: 3903371924,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.1944465637207,
		maxBraking: 0.800000011920929,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Pigalle",
		manufacturer: "Lampadati",
		price: 200000,
		weightKG: 1500,
		drivetrain: "FWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 149,
		model: "pigalle",
		hash: 1078682497,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.38888931274414,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.359999895095825,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Casco",
		manufacturer: "Lampadati",
		price: 452200,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120,
		gameMaxSpeedKPH: 151,
		model: "casco",
		hash: 941800958,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.9444465637207,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Tropos Rallye",
		manufacturer: "Lampadati",
		price: 408000,
		weightKG: 800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 152,
		model: "tropos",
		hash: 1887331236,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.22499999403953552
	},
	{
		displayName: "Furore GT",
		manufacturer: "Lampadati",
		price: 224000,
		weightKG: 1350,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.25,
		gameMaxSpeedKPH: 152,
		model: "furoregt",
		hash: 3205927392,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.559999942779541,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Felon GT",
		manufacturer: "Lampadati",
		price: 47500,
		weightKG: 1850,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.5,
		gameMaxSpeedKPH: 145,
		model: "felon2",
		hash: 4205676014,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Felon",
		manufacturer: "Lampadati",
		price: 45000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.75,
		gameMaxSpeedKPH: 145,
		model: "felon",
		hash: 3903372712,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Toro",
		manufacturer: "Lampadati",
		price: 875000,
		weightKG: 1100,
		drivetrain: null,
		realMaxSpeedMPH: 50.25,
		gameMaxSpeedKPH: 133,
		model: "toro",
		hash: 1070967343,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.9444465637207,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 18
	},
	{
		displayName: "Toro II",
		manufacturer: "Lampadati",
		price: 875000,
		weightKG: 1100,
		drivetrain: null,
		realMaxSpeedMPH: 50.25,
		gameMaxSpeedKPH: 133,
		model: "toro2",
		hash: 908897389,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.9444465637207,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 18
	},
	{
		displayName: "Sanctus",
		manufacturer: "LCC",
		price: 997500,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 144,
		model: "sanctus",
		hash: 1491277511,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40,
		maxBraking: 1,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.4050000011920929
	},
	{
		displayName: "Innovation",
		manufacturer: "LCC",
		price: 46250,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110,
		gameMaxSpeedKPH: 135,
		model: "innovation",
		hash: 4135840458,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Hexer",
		manufacturer: "LCC",
		price: 7500,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 135,
		model: "hexer",
		hash: 301427732,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Avarus",
		manufacturer: "LCC",
		price: 58000,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.5,
		gameMaxSpeedKPH: 135,
		model: "avarus",
		hash: 2179174271,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Mule Custom",
		manufacturer: "Maibatsu",
		price: 47880,
		weightKG: 6000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 76.25,
		gameMaxSpeedKPH: 100,
		model: "mule4",
		hash: 1945374990,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Mule (Armored)",
		manufacturer: "Maibatsu",
		price: 21612.5,
		weightKG: 12500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 72.75,
		gameMaxSpeedKPH: 100,
		model: "mule3",
		hash: 2242229361,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Penumbra",
		manufacturer: "Maibatsu",
		price: 12000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105.25,
		gameMaxSpeedKPH: 140,
		model: "penumbra",
		hash: 3917501776,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Sanchez (Livery)",
		manufacturer: "Maibatsu",
		price: 3500,
		weightKG: 220,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 118,
		model: "sanchez",
		hash: 788045382,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.51388931274414,
		maxBraking: 1.100000023841858,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.32899999618530273
	},
	{
		displayName: "Sanchez",
		manufacturer: "Maibatsu",
		price: 4000,
		weightKG: 220,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 118,
		model: "sanchez2",
		hash: 2841686334,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.51388931274414,
		maxBraking: 1.100000023841858,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.32899999618530273
	},
	{
		displayName: "Manchez",
		manufacturer: "Maibatsu",
		price: 33500,
		weightKG: 190,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.5,
		gameMaxSpeedKPH: 145,
		model: "manchez",
		hash: 2771538552,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.29499998688697815
	},
	{
		displayName: "Frogger",
		manufacturer: "Maibatsu",
		price: 650000,
		weightKG: 7000,
		drivetrain: null,
		realMaxSpeedMPH: 148.5,
		gameMaxSpeedKPH: 160,
		model: "frogger",
		hash: 744705981,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 56.66811752319336,
		maxBraking: 3.1099462509155273,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.48799991607666
	},
	{
		displayName: "Frogger II",
		manufacturer: "Maibatsu",
		price: 650000,
		weightKG: 7000,
		drivetrain: null,
		realMaxSpeedMPH: 148.5,
		gameMaxSpeedKPH: 160,
		model: "frogger2",
		hash: 1949211328,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 56.66811752319336,
		maxBraking: 3.1099462509155273,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.48799991607666
	},
	{
		displayName: "Mule",
		manufacturer: "Maibatsu",
		price: 13500,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 70.25,
		gameMaxSpeedKPH: 100,
		model: "mule",
		hash: 904750859,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Mule II",
		manufacturer: "Maibatsu",
		price: 13500,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 70.25,
		gameMaxSpeedKPH: 100,
		model: "mule2",
		hash: 3244501995,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Patriot Stretch",
		manufacturer: "Mammoth",
		price: 305900,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 96.25,
		gameMaxSpeedKPH: 130,
		model: "patriot2",
		hash: 3874056184,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.3199999928474426,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Avenger",
		manufacturer: "Mammoth",
		price: 1725000,
		weightKG: 18000,
		drivetrain: null,
		realMaxSpeedMPH: 178.5,
		gameMaxSpeedKPH: 250,
		model: "avenger",
		hash: 2176659152,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 95.98338317871094,
		maxBraking: 8.465734481811523,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 8.819999694824219
	},
	{
		displayName: "Thruster Jetpack",
		manufacturer: "Mammoth",
		price: 1828750,
		weightKG: 301,
		drivetrain: null,
		realMaxSpeedMPH: 126,
		gameMaxSpeedKPH: 160,
		model: "thruster",
		hash: 1489874736,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 57.539886474609375,
		maxBraking: 3.9472362995147705,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 6.860000133514404
	},
	{
		displayName: "Mogul",
		manufacturer: "Mammoth",
		price: 1562750,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 155.75,
		gameMaxSpeedKPH: 276.5,
		model: "mogul",
		hash: 3545667823,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 76.79570770263672,
		maxBraking: 4.51558780670166,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 5.880000114440918
	},
	{
		displayName: "Patriot",
		manufacturer: "Mammoth",
		price: 25000,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "patriot",
		hash: 3486509883,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.3199999928474426,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Tula",
		manufacturer: "Mammoth",
		price: 2586850,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 150,
		gameMaxSpeedKPH: 250,
		model: "tula",
		hash: 1043222410,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 69.36756134033203,
		maxBraking: 3.39901065826416,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 4.900000095367432
	},
	{
		displayName: "Hydra",
		manufacturer: "Mammoth",
		price: 1995000,
		weightKG: 8000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 209.25,
		gameMaxSpeedKPH: 327,
		model: "hydra",
		hash: 970385471,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 109.7642593383789,
		maxBraking: 9.681206703186035,
		maxTraction: 1.149999976158142,
		maxAcceleration: 8.819999694824219
	},
	{
		displayName: "Dodo",
		manufacturer: "Mammoth",
		price: 250000,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 134.25,
		gameMaxSpeedKPH: 250,
		model: "dodo",
		hash: 3393804037,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 69.36756134033203,
		maxBraking: 3.39901065826416,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 4.900000095367432
	},
	{
		displayName: "Asbo",
		manufacturer: "Maxwell",
		price: 204000,
		weightKG: 1030,
		drivetrain: "FWD",
		realMaxSpeedMPH: 96.5,
		gameMaxSpeedKPH: 126,
		model: "asbo",
		hash: 1118611807,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 35,
		maxBraking: 0.4699999988079071,
		maxTraction: 1.9199999570846558,
		maxAcceleration: 0.23399999737739563
	},
	{
		displayName: "Vagrant",
		manufacturer: "Maxwell",
		price: 1107000,
		weightKG: 670,
		drivetrain: "RWD",
		realMaxSpeedMPH: 122.5,
		gameMaxSpeedKPH: 149.65,
		model: "vagrant",
		hash: 740289177,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.5694465637207,
		maxBraking: 0.625,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.33250001072883606
	},
	{
		displayName: "Nightmare Cerberus",
		manufacturer: "MTL",
		price: 1935150,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.25,
		gameMaxSpeedKPH: 122,
		model: "cerberus3",
		hash: 1909700336,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.88888931274414,
		maxBraking: 0.25,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Future Shock Cerberus",
		manufacturer: "MTL",
		price: 1935150,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.25,
		gameMaxSpeedKPH: 122,
		model: "cerberus2",
		hash: 679453769,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.88888931274414,
		maxBraking: 0.25,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Apocalypse Cerberus",
		manufacturer: "MTL",
		price: 1935150,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.25,
		gameMaxSpeedKPH: 122,
		model: "cerberus",
		hash: 3493417227,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.88888931274414,
		maxBraking: 0.25,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Pounder Custom",
		manufacturer: "MTL",
		price: 160265,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 95.75,
		gameMaxSpeedKPH: 120,
		model: "pounder2",
		hash: 1653666139,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.5,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Wastelander",
		manufacturer: "MTL",
		price: 329175,
		weightKG: 7000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 89.75,
		gameMaxSpeedKPH: 125,
		model: "wastelander",
		hash: 2382949506,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Dune",
		manufacturer: "MTL",
		price: 650000,
		weightKG: 7000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 91.5,
		gameMaxSpeedKPH: 125,
		model: "rallytruck",
		hash: 2191146052,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Brickade",
		manufacturer: "MTL",
		price: 550000,
		weightKG: 14000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 83.5,
		gameMaxSpeedKPH: 105,
		model: "brickade",
		hash: 3989239879,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 29.166667938232422,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Flatbed",
		manufacturer: "MTL",
		price: 95000,
		weightKG: 6500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 76.25,
		gameMaxSpeedKPH: 130,
		model: "flatbed",
		hash: 1353720154,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Fire Truck",
		manufacturer: "MTL",
		price: 1647500,
		weightKG: 7500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 96,
		gameMaxSpeedKPH: 130,
		model: "firetruk",
		hash: 1938952078,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 8,
		maxPassengers: 7,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.5,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Pounder",
		manufacturer: "MTL",
		price: 100000,
		weightKG: 5500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 85.75,
		gameMaxSpeedKPH: 120,
		model: "pounder",
		hash: 2112052861,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.25,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Packer",
		manufacturer: "MTL",
		price: 250000,
		weightKG: 12000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 85.5,
		gameMaxSpeedKPH: 120,
		model: "packer",
		hash: 569305213,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.800000011920929,
		maxTraction: 1.5499999523162842,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Outlaw",
		manufacturer: "Nagasaki",
		price: 634000,
		weightKG: 850,
		drivetrain: "AWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 117,
		model: "outlaw",
		hash: 408825843,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 32.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.0250000953674316,
		maxAcceleration: 0.4749999940395355
	},
	{
		displayName: "Caddy (Utility)",
		manufacturer: "Nagasaki",
		price: 42500,
		weightKG: 600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 67,
		gameMaxSpeedKPH: 65,
		model: "caddy3",
		hash: 3525819835,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 18.055557250976562,
		maxBraking: 0.20000000298023224,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Caddy (Bunker)",
		manufacturer: "Nagasaki",
		price: 60000,
		weightKG: 600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 48.25,
		gameMaxSpeedKPH: 65,
		model: "caddy2",
		hash: 3757070668,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 18.055557250976562,
		maxBraking: 0.20000000298023224,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Caddy",
		manufacturer: "Nagasaki",
		price: 20000,
		weightKG: 600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 67,
		gameMaxSpeedKPH: 65,
		model: "caddy",
		hash: 1147287684,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 18.055557250976562,
		maxBraking: 0.20000000298023224,
		maxTraction: 1.5,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Street Blazer",
		manufacturer: "Nagasaki",
		price: 40500,
		weightKG: 550,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 125,
		model: "blazer4",
		hash: 3854198872,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 1,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.25
	},
	{
		displayName: "Hot Rod Blazer",
		manufacturer: "Nagasaki",
		price: 34500,
		weightKG: 600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 120,
		model: "blazer3",
		hash: 3025077634,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 1,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Blazer Lifeguard",
		manufacturer: "Nagasaki",
		price: 31000,
		weightKG: 650,
		drivetrain: "AWD",
		realMaxSpeedMPH: 78.75,
		gameMaxSpeedKPH: 110,
		model: "blazer2",
		hash: 4246935337,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.800000011920929,
		maxTraction: 2,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Blazer Aqua",
		manufacturer: "Nagasaki",
		price: 877800,
		weightKG: 550,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 125,
		model: "blazer5",
		hash: 2704629607,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 1,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.2720000147819519
	},
	{
		displayName: "Blazer",
		manufacturer: "Nagasaki",
		price: 4000,
		weightKG: 600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 98.75,
		gameMaxSpeedKPH: 120,
		model: "blazer",
		hash: 2166734073,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 1,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Shotaro",
		manufacturer: "Nagasaki",
		price: 1112500,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.75,
		gameMaxSpeedKPH: 159.5,
		model: "shotaro",
		hash: 3889340782,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 44.30555725097656,
		maxBraking: 1.399999976158142,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "Stryder",
		manufacturer: "Nagasaki",
		price: 335000,
		weightKG: null,
		drivetrain: "RWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: null,
		model: "stryder",
		hash: 301304410,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Chimera",
		manufacturer: "Nagasaki",
		price: 105000,
		weightKG: 401,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103,
		gameMaxSpeedKPH: 135,
		model: "chimera",
		hash: 6774487,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.2750000059604645
	},
	{
		displayName: "Carbon RS",
		manufacturer: "Nagasaki",
		price: 20000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 145,
		model: "carbonrs",
		hash: 11251904,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1.2999999523162842,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "BF400",
		manufacturer: "Nagasaki",
		price: 47500,
		weightKG: 150,
		drivetrain: "RWD",
		realMaxSpeedMPH: 137,
		gameMaxSpeedKPH: 145,
		model: "bf400",
		hash: 86520421,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1.100000023841858,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Havok",
		manufacturer: "Nagasaki",
		price: 1150450,
		weightKG: 1000,
		drivetrain: null,
		realMaxSpeedMPH: 154.25,
		gameMaxSpeedKPH: 160,
		model: "havok",
		hash: 2310691317,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 57.9072265625,
		maxBraking: 3.121199607849121,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.390000343322754
	},
	{
		displayName: "Buzzard Attack Chopper",
		manufacturer: "Nagasaki",
		price: 875000,
		weightKG: 3800,
		drivetrain: null,
		realMaxSpeedMPH: 145,
		gameMaxSpeedKPH: 160,
		model: "buzzard",
		hash: 788747387,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 57.9072265625,
		maxBraking: 3.121199607849121,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.390000343322754
	},
	{
		displayName: "Buzzard",
		manufacturer: "Nagasaki",
		price: 100000,
		weightKG: 3800,
		drivetrain: null,
		realMaxSpeedMPH: 145,
		gameMaxSpeedKPH: 160,
		model: "buzzard2",
		hash: 745926877,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 57.9072265625,
		maxBraking: 3.121199607849121,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.390000343322754
	},
	{
		displayName: "Dinghy (2-seater)",
		manufacturer: "Nagasaki",
		price: 100000,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 71.5,
		gameMaxSpeedKPH: 125,
		model: "dinghy2",
		hash: 276773164,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Dinghy",
		manufacturer: "Nagasaki",
		price: 83125,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 71.5,
		gameMaxSpeedKPH: 125,
		model: "dinghy",
		hash: 1033245328,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Dinghy II",
		manufacturer: "Nagasaki",
		price: 83125,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 71.5,
		gameMaxSpeedKPH: 125,
		model: "dinghy3",
		hash: 509498602,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Dinghy III",
		manufacturer: "Nagasaki",
		price: 83125,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 71.5,
		gameMaxSpeedKPH: 125,
		model: "dinghy4",
		hash: 867467158,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Invade and Persuade RC Tank",
		manufacturer: null,
		price: 1137500,
		weightKG: 500,
		drivetrain: "AWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 37,
		model: "minitank",
		hash: 3040635986,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 10.277778625488281,
		maxBraking: 0.15000000596046448,
		maxTraction: 2,
		maxAcceleration: 0.05999999865889549
	},
	{
		displayName: "RC Bandito",
		manufacturer: null,
		price: 795000,
		weightKG: 85,
		drivetrain: "AWD",
		realMaxSpeedMPH: 60,
		gameMaxSpeedKPH: 80,
		model: "rcbandito",
		hash: 4008920556,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 22.22222328186035,
		maxBraking: 0.800000011920929,
		maxTraction: 2.950000047683716,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "B-11 Strikeforce",
		manufacturer: null,
		price: 1900000,
		weightKG: 14000,
		drivetrain: null,
		realMaxSpeedMPH: 163.75,
		gameMaxSpeedKPH: 254.6,
		model: "strikeforce",
		hash: 1692272545,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 70.71067810058594,
		maxBraking: 11.087433815002441,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 15.680000305175781
	},
	{
		displayName: "Blimp",
		manufacturer: null,
		price: 595175,
		weightKG: 12000,
		drivetrain: null,
		realMaxSpeedMPH: 105,
		gameMaxSpeedKPH: 160,
		model: "blimp3",
		hash: 3987008919,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 70,
		maxBraking: 3.978800058364868,
		maxTraction: 0.6499999761581421,
		maxAcceleration: 5.684000015258789
	},
	{
		displayName: "Festival Bus",
		manufacturer: null,
		price: 921025,
		weightKG: 8000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 59.75,
		gameMaxSpeedKPH: 90,
		model: "pbus2",
		hash: 345756458,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 11,
		maxPassengers: 10,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 25.000001907348633,
		maxBraking: 0.25,
		maxTraction: 1.149999976158142,
		maxAcceleration: 0.12999999523162842
	},
	{
		displayName: "Sea Sparrow",
		manufacturer: null,
		price: 907500,
		weightKG: 3500,
		drivetrain: null,
		realMaxSpeedMPH: 153.75,
		gameMaxSpeedKPH: 160,
		model: "seasparrow",
		hash: 3568198617,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 56.596221923828125,
		maxBraking: 2.9396073818206787,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.193999767303467
	},
	{
		displayName: "TM-02 Khanjali Tank",
		manufacturer: null,
		price: 1925175,
		weightKG: 30000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 42,
		gameMaxSpeedKPH: 57,
		model: "khanjali",
		hash: 2859440138,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 15.833333969116211,
		maxBraking: 0.20000000298023224,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "RCV",
		manufacturer: null,
		price: 1562750,
		weightKG: 12500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 96.75,
		gameMaxSpeedKPH: 125,
		model: "riot2",
		hash: 2601952180,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.75,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Barrage",
		manufacturer: null,
		price: 1060675,
		weightKG: 2500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 108.75,
		gameMaxSpeedKPH: 135,
		model: "barrage",
		hash: 4081974053,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.8500000238418579,
		maxTraction: 1.75,
		maxAcceleration: 0.2224999964237213
	},
	{
		displayName: "Volatol",
		manufacturer: null,
		price: 1862000,
		weightKG: 40000,
		drivetrain: null,
		realMaxSpeedMPH: 165.5,
		gameMaxSpeedKPH: 250,
		model: "volatol",
		hash: 447548909,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 80.27928161621094,
		maxBraking: 5.113790035247803,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 6.369999885559082
	},
	{
		displayName: "Akula",
		manufacturer: null,
		price: 1852025,
		weightKG: 8000,
		drivetrain: null,
		realMaxSpeedMPH: 157.25,
		gameMaxSpeedKPH: 160,
		model: "akula",
		hash: 1181327175,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 61.0891227722168,
		maxBraking: 3.5920403003692627,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.880000114440918
	},
	{
		displayName: "FH-1 Hunter",
		manufacturer: null,
		price: 2061500,
		weightKG: 6000,
		drivetrain: null,
		realMaxSpeedMPH: 141.5,
		gameMaxSpeedKPH: 160,
		model: "hunter",
		hash: 4252008158,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 58.554256439208984,
		maxBraking: 3.2134575843811035,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 5.48799991607666
	},
	{
		displayName: "P-45 Nokota",
		manufacturer: null,
		price: 1326675,
		weightKG: 3200,
		drivetrain: "FWD",
		realMaxSpeedMPH: 201,
		gameMaxSpeedKPH: 328.6,
		model: "nokota",
		hash: 1036591958,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 87.70580291748047,
		maxBraking: 12.892753601074219,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 14.700000762939453
	},
	{
		displayName: "Mobile Operations Center (Trailer)",
		manufacturer: null,
		price: 612500,
		weightKG: 13500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 88.5,
		gameMaxSpeedKPH: null,
		model: "trailerlarge",
		hash: 1502869817,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 3,
		maxPassengers: 2,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 29.166667938232422,
		maxBraking: 0.699999988079071,
		maxTraction: 3.299999952316284,
		maxAcceleration: 0
	},
	{
		displayName: "RM-10 Bombushka",
		manufacturer: null,
		price: 2959250,
		weightKG: 30100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 84.5,
		gameMaxSpeedKPH: 281.5,
		model: "bombushka",
		hash: 4262088844,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.51483917236328,
		maxBraking: 1.968150019645691,
		maxTraction: 0.8500000238418579,
		maxAcceleration: 5.390000343322754
	},
	{
		displayName: "Metro Train",
		manufacturer: null,
		price: 100000,
		weightKG: 25000,
		drivetrain: "RWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 80,
		model: "metrotrain",
		hash: 868868440,
		"class": {
			id: 21,
			name: "Trains"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 22.22222328186035,
		maxBraking: 5,
		maxTraction: 2.5,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Freight Train",
		manufacturer: null,
		price: 100000,
		weightKG: 25084,
		drivetrain: "RWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 80,
		model: "freight",
		hash: 1030400667,
		"class": {
			id: 21,
			name: "Trains"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 22.22222328186035,
		maxBraking: 5,
		maxTraction: 2.5,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Cable Car",
		manufacturer: null,
		price: 100000,
		weightKG: null,
		drivetrain: null,
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: null,
		model: "cablecar",
		hash: 3334677549,
		"class": {
			id: 21,
			name: "Trains"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 22.22222328186035,
		maxBraking: 5,
		maxTraction: 2.5,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Cargo Plane",
		manufacturer: null,
		price: 100000,
		weightKG: 38000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 139.25,
		gameMaxSpeedKPH: 284,
		model: "cargoplane",
		hash: 368211810,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 78.90234375,
		maxBraking: 4.87143087387085,
		maxTraction: 0.8500000238418579,
		maxAcceleration: 6.174000263214111
	},
	{
		displayName: "Xero Blimp",
		manufacturer: null,
		price: 100000,
		weightKG: 12000,
		drivetrain: null,
		realMaxSpeedMPH: 105,
		gameMaxSpeedKPH: 160,
		model: "blimp2",
		hash: 3681241380,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 70,
		maxBraking: 4.253200054168701,
		maxTraction: 0.6499999761581421,
		maxAcceleration: 6.076000213623047
	},
	{
		displayName: "V-65 Molotok",
		manufacturer: null,
		price: 2394000,
		weightKG: 3200,
		drivetrain: "FWD",
		realMaxSpeedMPH: 207.75,
		gameMaxSpeedKPH: 328.6,
		model: "molotok",
		hash: 1565978651,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 91.28709411621094,
		maxBraking: 13.419203758239746,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 14.700000762939453
	},
	{
		displayName: "Titan",
		manufacturer: null,
		price: 1000000,
		weightKG: 38000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 133.25,
		gameMaxSpeedKPH: 281.5,
		model: "titan",
		hash: 1981688531,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 78.20576477050781,
		maxBraking: 4.751782417297363,
		maxTraction: 0.8500000238418579,
		maxAcceleration: 6.076000213623047
	},
	{
		displayName: "LF-22 Starling",
		manufacturer: null,
		price: 1828750,
		weightKG: 2000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 187.75,
		gameMaxSpeedKPH: 284.4,
		model: "starling",
		hash: 2594093022,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 87.5,
		maxBraking: 10.71875,
		maxTraction: 1.149999976158142,
		maxAcceleration: 12.25
	},
	{
		displayName: "Jet",
		manufacturer: null,
		price: 100000,
		weightKG: 38000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 142,
		gameMaxSpeedKPH: 284,
		model: "jet",
		hash: 1058115860,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 78.90234375,
		maxBraking: 4.87143087387085,
		maxTraction: 1.600000023841858,
		maxAcceleration: 6.174000263214111
	},
	{
		displayName: "Atomic Blimp",
		manufacturer: null,
		price: 100000,
		weightKG: 12000,
		drivetrain: null,
		realMaxSpeedMPH: 105,
		gameMaxSpeedKPH: 160,
		model: "blimp",
		hash: 4143991942,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 70,
		maxBraking: 3.978800058364868,
		maxTraction: 0.6499999761581421,
		maxAcceleration: 5.684000015258789
	},
	{
		displayName: "Rhino Tank",
		manufacturer: null,
		price: 750000,
		weightKG: 60000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 40.5,
		gameMaxSpeedKPH: 55,
		model: "rhino",
		hash: 782665360,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 15.277778625488281,
		maxBraking: 0.20000000298023224,
		maxTraction: 2.5,
		maxAcceleration: 0.10999999940395355
	},
	{
		displayName: "Savage",
		manufacturer: null,
		price: 1296750,
		weightKG: 14000,
		drivetrain: null,
		realMaxSpeedMPH: 144.5,
		gameMaxSpeedKPH: 160,
		model: "savage",
		hash: 4212341271,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 65.19527435302734,
		maxBraking: 2.9901158809661865,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.586400032043457
	},
	{
		displayName: "Whippet Race Bike",
		manufacturer: null,
		price: 5000,
		weightKG: 110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 47,
		gameMaxSpeedKPH: 63,
		model: "tribike",
		hash: 1127861609,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 17.5,
		maxBraking: 2.5,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.13500000536441803
	},
	{
		displayName: "Tri-Cycles Race Bike",
		manufacturer: null,
		price: 5000,
		weightKG: 110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 47,
		gameMaxSpeedKPH: 63,
		model: "tribike3",
		hash: 3894672200,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 17.5,
		maxBraking: 2.5,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.13500000536441803
	},
	{
		displayName: "Scorcher",
		manufacturer: null,
		price: 1000,
		weightKG: 115,
		drivetrain: "RWD",
		realMaxSpeedMPH: 38.25,
		gameMaxSpeedKPH: 55,
		model: "scorcher",
		hash: 4108429845,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 15.277778625488281,
		maxBraking: 2.799999952316284,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.17000000178813934
	},
	{
		displayName: "Fixter",
		manufacturer: null,
		price: 2000,
		weightKG: 110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 44.25,
		gameMaxSpeedKPH: 63,
		model: "fixter",
		hash: 3458454463,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 17.5,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.13500000536441803
	},
	{
		displayName: "Endurex Race Bike",
		manufacturer: null,
		price: 5000,
		weightKG: 110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 47,
		gameMaxSpeedKPH: 63,
		model: "tribike2",
		hash: 3061159916,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 17.5,
		maxBraking: 2.5,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.13500000536441803
	},
	{
		displayName: "Cruiser",
		manufacturer: null,
		price: 400,
		weightKG: 120,
		drivetrain: "RWD",
		realMaxSpeedMPH: 33.5,
		gameMaxSpeedKPH: 45,
		model: "cruiser",
		hash: 448402357,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 12.500000953674316,
		maxBraking: 2.799999952316284,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.07999999821186066
	},
	{
		displayName: "BMX",
		manufacturer: null,
		price: 400,
		weightKG: 105,
		drivetrain: "RWD",
		realMaxSpeedMPH: 35.25,
		gameMaxSpeedKPH: 50,
		model: "bmx",
		hash: 1131912276,
		"class": {
			id: 13,
			name: "Cycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 13.88888931274414,
		maxBraking: 3,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Submersible",
		manufacturer: null,
		price: 100000,
		weightKG: 3000,
		drivetrain: null,
		realMaxSpeedMPH: 19.75,
		gameMaxSpeedKPH: 75,
		model: "submersible",
		hash: 771711535,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 20.83333396911621,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 8
	},
	{
		displayName: "Police Predator",
		manufacturer: null,
		price: 100000,
		weightKG: 2500,
		drivetrain: null,
		realMaxSpeedMPH: 48.5,
		gameMaxSpeedKPH: 120,
		model: "predator",
		hash: 3806844075,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 14
	},
	{
		displayName: "8F Drafter",
		manufacturer: "Obey",
		price: 359000,
		weightKG: 1650,
		drivetrain: "AWD",
		realMaxSpeedMPH: 117.5,
		gameMaxSpeedKPH: 150,
		model: "drafter",
		hash: 686471183,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.694999933242798,
		maxAcceleration: 0.34200000762939453
	},
	{
		displayName: "Rocoto",
		manufacturer: "Obey",
		price: 42500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 107.5,
		gameMaxSpeedKPH: 139,
		model: "rocoto",
		hash: 2136773105,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.611114501953125,
		maxBraking: 0.25,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.1899999976158142
	},
	{
		displayName: "Omnis",
		manufacturer: "Obey",
		price: 350500,
		weightKG: 1090,
		drivetrain: "AWD",
		realMaxSpeedMPH: 112.5,
		gameMaxSpeedKPH: 152,
		model: "omnis",
		hash: 3517794615,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.140000104904175,
		maxAcceleration: 0.3050000071525574
	},
	{
		displayName: "9F Cabrio",
		manufacturer: "Obey",
		price: 65000,
		weightKG: 1300,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.75,
		gameMaxSpeedKPH: 155,
		model: "ninef2",
		hash: 2833484545,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "9F",
		manufacturer: "Obey",
		price: 60000,
		weightKG: 1300,
		drivetrain: "AWD",
		realMaxSpeedMPH: 119.75,
		gameMaxSpeedKPH: 155,
		model: "ninef",
		hash: 1032823388,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 1,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Tailgater",
		manufacturer: "Obey",
		price: 27500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 145,
		model: "tailgater",
		hash: 3286105550,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "R88 (Formula 2 Car)",
		manufacturer: "Ocelot",
		price: 1757500,
		weightKG: null,
		drivetrain: null,
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: null,
		model: "formula2",
		hash: 2334210311,
		"class": {
			id: 22
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 45.13888931274414,
		maxBraking: 1.25,
		maxTraction: 3.2654998302459717,
		maxAcceleration: 0.7450000047683716
	},
	{
		displayName: "Jugular",
		manufacturer: "Ocelot",
		price: 612500,
		weightKG: 1745,
		drivetrain: "AWD",
		realMaxSpeedMPH: 126.5,
		gameMaxSpeedKPH: 157.5,
		model: "jugular",
		hash: 4086055493,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.750003814697266,
		maxBraking: 1.100000023841858,
		maxTraction: 20.959999084472656,
		maxAcceleration: 0.3779999911785126
	},
	{
		displayName: "Locust",
		manufacturer: "Ocelot",
		price: 812500,
		weightKG: 920,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.75,
		gameMaxSpeedKPH: 154.7,
		model: "locust",
		hash: 3353694737,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.972225189208984,
		maxBraking: 1,
		maxTraction: 21.479999542236328,
		maxAcceleration: 0.33399999141693115
	},
	{
		displayName: "Swinger",
		manufacturer: "Ocelot",
		price: 454500,
		weightKG: 900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118.25,
		gameMaxSpeedKPH: 160,
		model: "swinger",
		hash: 500482303,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 0.9950000047683716,
		maxTraction: 2.4000000953674316,
		maxAcceleration: 0.38999998569488525
	},
	{
		displayName: "Stromberg",
		manufacturer: "Ocelot",
		price: 1592675,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.75,
		gameMaxSpeedKPH: 150,
		model: "stromberg",
		hash: 886810209,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1,
		maxTraction: 2.5,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Pariah",
		manufacturer: "Ocelot",
		price: 710000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 136,
		gameMaxSpeedKPH: 155.1,
		model: "pariah",
		hash: 867799010,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.083335876464844,
		maxBraking: 1,
		maxTraction: 2.625,
		maxAcceleration: 0.32100000977516174
	},
	{
		displayName: "XA-21",
		manufacturer: "Ocelot",
		price: 1187500,
		weightKG: 1450,
		drivetrain: "AWD",
		realMaxSpeedMPH: 122.5,
		gameMaxSpeedKPH: 159.2,
		model: "xa21",
		hash: 917809321,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.222225189208984,
		maxBraking: 1.100000023841858,
		maxTraction: 2.680000066757202,
		maxAcceleration: 0.36399999260902405
	},
	{
		displayName: "Penetrator",
		manufacturer: "Ocelot",
		price: 440000,
		weightKG: 1470,
		drivetrain: "AWD",
		realMaxSpeedMPH: 124,
		gameMaxSpeedKPH: 159.5,
		model: "penetrator",
		hash: 2536829930,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.30555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 2.5799999237060547,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Ardent",
		manufacturer: "Ocelot",
		price: 575000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 148,
		model: "ardent",
		hash: 159274291,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.2849999964237213
	},
	{
		displayName: "Lynx",
		manufacturer: "Ocelot",
		price: 867500,
		weightKG: 1725,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.5,
		gameMaxSpeedKPH: 157,
		model: "lynx",
		hash: 482197771,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.611114501953125,
		maxBraking: 1,
		maxTraction: 2.559999942779541,
		maxAcceleration: 0.3149999976158142
	},
	{
		displayName: "Jackal",
		manufacturer: "Ocelot",
		price: 30000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.5,
		gameMaxSpeedKPH: 142.5,
		model: "jackal",
		hash: 3670438162,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.583335876464844,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "F620",
		manufacturer: "Ocelot",
		price: 40000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.5,
		gameMaxSpeedKPH: 145,
		model: "f620",
		hash: 3703357000,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Imorgon",
		manufacturer: "Overflod",
		price: 1082500,
		weightKG: 1600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 107.25,
		gameMaxSpeedKPH: 148.5,
		model: "imorgon",
		hash: 3162245632,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.250003814697266,
		maxBraking: 0.8349999785423279,
		maxTraction: 25.33049964904785,
		maxAcceleration: 0.6600000262260437
	},
	{
		displayName: "Tyrant",
		manufacturer: "Overflod",
		price: 1257500,
		weightKG: 1175,
		drivetrain: "RWD",
		realMaxSpeedMPH: 127,
		gameMaxSpeedKPH: 165,
		model: "tyrant",
		hash: 3918533058,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 45.833335876464844,
		maxBraking: 1,
		maxTraction: 31.625,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Entity XXR",
		manufacturer: "Overflod",
		price: 1152500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 128,
		gameMaxSpeedKPH: 170,
		model: "entity2",
		hash: 2174267100,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 47.222225189208984,
		maxBraking: 1,
		maxTraction: 19.736249923706055,
		maxAcceleration: 0.35499998927116394
	},
	{
		displayName: "Autarch",
		manufacturer: "Overflod",
		price: 977500,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125.5,
		gameMaxSpeedKPH: 161,
		model: "autarch",
		hash: 3981782132,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.722225189208984,
		maxBraking: 1.2000000476837158,
		maxTraction: 30.634122848510742,
		maxAcceleration: 0.37700000405311584
	},
	{
		displayName: "Entity XF",
		manufacturer: "Overflod",
		price: 397500,
		weightKG: 1500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 121.5,
		gameMaxSpeedKPH: 155,
		model: "entityxf",
		hash: 3003014393,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.75,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Zorrusso",
		manufacturer: "Pegassi",
		price: 962500,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 161,
		model: "zorrusso",
		hash: 3612858749,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.722225189208984,
		maxBraking: 1.2000000476837158,
		maxTraction: 30.417198181152344,
		maxAcceleration: 0.37450000643730164
	},
	{
		displayName: "Toros",
		manufacturer: "Pegassi",
		price: 249000,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127.5,
		gameMaxSpeedKPH: 155,
		model: "toros",
		hash: 3126015148,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.05555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Oppressor MK II",
		manufacturer: "Pegassi",
		price: 1945125,
		weightKG: 220,
		drivetrain: "RWD",
		realMaxSpeedMPH: 127.75,
		gameMaxSpeedKPH: 148,
		model: "oppressor2",
		hash: 2069146067,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.3799999952316284
	},
	{
		displayName: "Tezeract",
		manufacturer: "Pegassi",
		price: 1412500,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 125.5,
		gameMaxSpeedKPH: 169,
		model: "tezeract",
		hash: 1031562256,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 46.9444465637207,
		maxBraking: 1.2000000476837158,
		maxTraction: 18.06999969482422,
		maxAcceleration: 0.13750000298023224
	},
	{
		displayName: "Zentorno",
		manufacturer: "Pegassi",
		price: 362500,
		weightKG: 1500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 122,
		gameMaxSpeedKPH: 159,
		model: "zentorno",
		hash: 2891838741,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3540000021457672
	},
	{
		displayName: "Vacca",
		manufacturer: "Pegassi",
		price: 120000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.25,
		gameMaxSpeedKPH: 152,
		model: "vacca",
		hash: 338562499,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Tempesta",
		manufacturer: "Pegassi",
		price: 664500,
		weightKG: 1422,
		drivetrain: "AWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 157,
		model: "tempesta",
		hash: 272929391,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.611114501953125,
		maxBraking: 1,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Reaper",
		manufacturer: "Pegassi",
		price: 797500,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.75,
		gameMaxSpeedKPH: 159,
		model: "reaper",
		hash: 234062309,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1.100000023841858,
		maxTraction: 2.6700000762939453,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Osiris",
		manufacturer: "Pegassi",
		price: 975000,
		weightKG: 1350,
		drivetrain: "AWD",
		realMaxSpeedMPH: 122,
		gameMaxSpeedKPH: 159.1,
		model: "osiris",
		hash: 1987142870,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.1944465637207,
		maxBraking: 1.0499999523162842,
		maxTraction: 2.6600000858306885,
		maxAcceleration: 0.36000001430511475
	},
	{
		displayName: "Infernus",
		manufacturer: "Pegassi",
		price: 220000,
		weightKG: 1200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 150,
		model: "infernus",
		hash: 418536135,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.5,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Torero",
		manufacturer: "Pegassi",
		price: 499000,
		weightKG: 1470,
		drivetrain: "RWD",
		realMaxSpeedMPH: 116.5,
		gameMaxSpeedKPH: 149.5,
		model: "torero",
		hash: 1504306544,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.52777862548828,
		maxBraking: 0.5,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Monroe",
		manufacturer: "Pegassi",
		price: 245000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 122,
		gameMaxSpeedKPH: 150,
		model: "monroe",
		hash: 3861591579,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Infernus Classic",
		manufacturer: "Pegassi",
		price: 457500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 149.5,
		model: "infernus2",
		hash: 2889029532,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.52777862548828,
		maxBraking: 0.5,
		maxTraction: 2.634999990463257,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Ultralight",
		manufacturer: "Pegassi",
		price: 332500,
		weightKG: 250,
		drivetrain: "FWD",
		realMaxSpeedMPH: 73.25,
		gameMaxSpeedKPH: 78.6,
		model: "microlight",
		hash: 2531412055,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 30.151134490966797,
		maxBraking: 4.136735916137695,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 13.720000267028809
	},
	{
		displayName: "Vortex",
		manufacturer: "Pegassi",
		price: 178000,
		weightKG: 190,
		drivetrain: "RWD",
		realMaxSpeedMPH: 115.75,
		gameMaxSpeedKPH: 148,
		model: "vortex",
		hash: 3685342204,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.4025000035762787
	},
	{
		displayName: "Ruffian",
		manufacturer: "Pegassi",
		price: 5000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 127,
		gameMaxSpeedKPH: 140,
		model: "ruffian",
		hash: 3401388520,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.100000023841858,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Oppressor",
		manufacturer: "Pegassi",
		price: 1762250,
		weightKG: 190,
		drivetrain: "RWD",
		realMaxSpeedMPH: 140,
		gameMaxSpeedKPH: 148,
		model: "oppressor",
		hash: 884483972,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.125,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "FCR 1000 Custom",
		manufacturer: "Pegassi",
		price: 98000,
		weightKG: 200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.5,
		gameMaxSpeedKPH: 140.2,
		model: "fcr2",
		hash: 3537231886,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.9444465637207,
		maxBraking: 1.25,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "FCR 1000",
		manufacturer: "Pegassi",
		price: 67500,
		weightKG: 210,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 140,
		model: "fcr",
		hash: 627535535,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.3050000071525574
	},
	{
		displayName: "Faggio Sport",
		manufacturer: "Pegassi",
		price: 23750,
		weightKG: 110,
		drivetrain: "RWD",
		realMaxSpeedMPH: 76.75,
		gameMaxSpeedKPH: 95,
		model: "faggio",
		hash: 2452219115,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 26.38888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.19750000536441803
	},
	{
		displayName: "Faggio Mod",
		manufacturer: "Pegassi",
		price: 27500,
		weightKG: 100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 74.25,
		gameMaxSpeedKPH: 90,
		model: "faggio3",
		hash: 3005788552,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 25.000001907348633,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.19499999284744263
	},
	{
		displayName: "Faggio",
		manufacturer: "Pegassi",
		price: 2500,
		weightKG: 100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 90,
		model: "faggio2",
		hash: 55628203,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 25.000001907348633,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.10000000149011612
	},
	{
		displayName: "Esskey",
		manufacturer: "Pegassi",
		price: 132000,
		weightKG: 190,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112.75,
		gameMaxSpeedKPH: 145,
		model: "esskey",
		hash: 2035069708,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.29499998688697815
	},
	{
		displayName: "Bati 801RR",
		manufacturer: "Pegassi",
		price: 7500,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 135,
		gameMaxSpeedKPH: 150,
		model: "bati2",
		hash: 3403504941,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1.399999976158142,
		maxTraction: 2.319999933242798,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Bati 801",
		manufacturer: "Pegassi",
		price: 7500,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 135,
		gameMaxSpeedKPH: 150,
		model: "bati",
		hash: 4180675781,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1.399999976158142,
		maxTraction: 2.319999933242798,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Speeder",
		manufacturer: "Pegassi",
		price: 162500,
		weightKG: 2400,
		drivetrain: null,
		realMaxSpeedMPH: 68.25,
		gameMaxSpeedKPH: 133,
		model: "speeder",
		hash: 231083307,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.9444465637207,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Speeder II",
		manufacturer: "Pegassi",
		price: 162500,
		weightKG: 2400,
		drivetrain: null,
		realMaxSpeedMPH: 68.25,
		gameMaxSpeedKPH: 133,
		model: "speeder2",
		hash: 437538602,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.9444465637207,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 16
	},
	{
		displayName: "Comet SR",
		manufacturer: "Pfister",
		price: 572500,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 122,
		gameMaxSpeedKPH: 157.5,
		model: "comet5",
		hash: 661493923,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.750003814697266,
		maxBraking: 1.2000000476837158,
		maxTraction: 23.962499618530273,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Neon",
		manufacturer: "Pfister",
		price: 750000,
		weightKG: 2000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 114,
		gameMaxSpeedKPH: 156.5,
		model: "neon",
		hash: 2445973230,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.472225189208984,
		maxBraking: 1.2999999523162842,
		maxTraction: 2.2750000953674316,
		maxAcceleration: 0.25049999356269836
	},
	{
		displayName: "Comet Safari",
		manufacturer: "Pfister",
		price: 355000,
		weightKG: 1150,
		drivetrain: "AWD",
		realMaxSpeedMPH: 120,
		gameMaxSpeedKPH: 152,
		model: "comet4",
		hash: 1561920505,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.29249998927116394
	},
	{
		displayName: "811",
		manufacturer: "Pfister",
		price: 567500,
		weightKG: 1600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 132.5,
		gameMaxSpeedKPH: 159.3,
		model: "pfister811",
		hash: 2465164804,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.250003814697266,
		maxBraking: 1.1200000047683716,
		maxTraction: 2.687999963760376,
		maxAcceleration: 0.35600000619888306
	},
	{
		displayName: "Comet Retro Custom",
		manufacturer: "Pfister",
		price: 322500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 152,
		model: "comet3",
		hash: 2272483501,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.9714999198913574,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Comet",
		manufacturer: "Pfister",
		price: 50000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 119.5,
		gameMaxSpeedKPH: 152,
		model: "comet2",
		hash: 3249425686,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Deveste Eight",
		manufacturer: "Principe",
		price: 897500,
		weightKG: 2300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 131.75,
		gameMaxSpeedKPH: 170,
		model: "deveste",
		hash: 1591739866,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 47.222225189208984,
		maxBraking: 1,
		maxTraction: 2.7249999046325684,
		maxAcceleration: 0.41999998688697815
	},
	{
		displayName: "Nemesis",
		manufacturer: "Principe",
		price: 6000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 111.25,
		gameMaxSpeedKPH: 140,
		model: "nemesis",
		hash: 3660088182,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Lectro",
		manufacturer: "Principe",
		price: 498750,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.25,
		gameMaxSpeedKPH: 140,
		model: "lectro",
		hash: 640818791,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Diabolus Custom",
		manufacturer: "Principe",
		price: 122500,
		weightKG: 210,
		drivetrain: "RWD",
		realMaxSpeedMPH: 115.25,
		gameMaxSpeedKPH: 142.6,
		model: "diablous2",
		hash: 1790834270,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.611114501953125,
		maxBraking: 1.25,
		maxTraction: 2,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Diabolus",
		manufacturer: "Principe",
		price: 84500,
		weightKG: 220,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 142.5,
		model: "diablous",
		hash: 4055125828,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.583335876464844,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.31200000643730164
	},
	{
		displayName: "PR4 (Formula 1 Car)",
		manufacturer: "Progen",
		price: 1757500,
		weightKG: 505,
		drivetrain: "RWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 162.5,
		model: "formula",
		hash: 340154634,
		"class": {
			id: 22
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 45.13888931274414,
		maxBraking: 1.25,
		maxTraction: 3.4075000286102295,
		maxAcceleration: 0.75
	},
	{
		displayName: "Emerus",
		manufacturer: "Progen",
		price: 1375000,
		weightKG: 1198,
		drivetrain: "RWD",
		realMaxSpeedMPH: 127.25,
		gameMaxSpeedKPH: 161.3,
		model: "emerus",
		hash: 1323778901,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.80555725097656,
		maxBraking: 1.2000000476837158,
		maxTraction: 36.834999084472656,
		maxAcceleration: 0.3779999911785126
	},
	{
		displayName: "Tyrus",
		manufacturer: "Progen",
		price: 1275000,
		weightKG: 915,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 161,
		model: "tyrus",
		hash: 2067820283,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.722225189208984,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.9998161792755127,
		maxAcceleration: 0.3709999918937683
	},
	{
		displayName: "T20",
		manufacturer: "Progen",
		price: 1100000,
		weightKG: 1395,
		drivetrain: "AWD",
		realMaxSpeedMPH: 122.25,
		gameMaxSpeedKPH: 159.3,
		model: "t20",
		hash: 1663218586,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.250003814697266,
		maxBraking: 1.100000023841858,
		maxTraction: 2.680000066757202,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Itali GTB Custom",
		manufacturer: "Progen",
		price: 247500,
		weightKG: 1600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127,
		gameMaxSpeedKPH: 159.2,
		model: "italigtb2",
		hash: 3812247419,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.222225189208984,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.68387508392334,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Itali GTB",
		manufacturer: "Progen",
		price: 594500,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 126.25,
		gameMaxSpeedKPH: 159,
		model: "italigtb",
		hash: 2246633323,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1.100000023841858,
		maxTraction: 2.5,
		maxAcceleration: 0.33649998903274536
	},
	{
		displayName: "GP1",
		manufacturer: "Progen",
		price: 630000,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.75,
		gameMaxSpeedKPH: 160.5,
		model: "gp1",
		hash: 1234311532,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.583335876464844,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.797250270843506,
		maxAcceleration: 0.3700000047683716
	},
	{
		displayName: "Zhaba",
		manufacturer: "RUNE",
		price: 1200000,
		weightKG: 1600,
		drivetrain: "AWD",
		realMaxSpeedMPH: null,
		gameMaxSpeedKPH: 92.5,
		model: "zhaba",
		hash: 1284356689,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 25.694446563720703,
		maxBraking: 0.800000011920929,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Cheburek",
		manufacturer: "RUNE",
		price: 72500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108.75,
		gameMaxSpeedKPH: 140,
		model: "cheburek",
		hash: 3306466016,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "Deviant",
		manufacturer: "Schyster",
		price: 256000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108.5,
		gameMaxSpeedKPH: 145,
		model: "deviant",
		hash: 1279262537,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Fusilade",
		manufacturer: "Schyster",
		price: 18000,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.75,
		gameMaxSpeedKPH: 149,
		model: "fusilade",
		hash: 499169875,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.38888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Vader",
		manufacturer: "Shitzu",
		price: 4500,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107.75,
		gameMaxSpeedKPH: 140,
		model: "vader",
		hash: 4154065143,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 1.100000023841858,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "PCJ 600",
		manufacturer: "Shitzu",
		price: 4500,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.75,
		gameMaxSpeedKPH: 130,
		model: "pcj",
		hash: 3385765638,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 1.2999999523162842,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Hakuchou Drag Bike",
		manufacturer: "Shitzu",
		price: 488000,
		weightKG: 270,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.5,
		gameMaxSpeedKPH: 159,
		model: "hakuchou2",
		hash: 4039289119,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1.399999976158142,
		maxTraction: 2.9000000953674316,
		maxAcceleration: 0.42500001192092896
	},
	{
		displayName: "Hakuchou",
		manufacturer: "Shitzu",
		price: 41000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 134,
		gameMaxSpeedKPH: 152,
		model: "hakuchou",
		hash: 1265391242,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1.399999976158142,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.3149999976158142
	},
	{
		displayName: "Defiler",
		manufacturer: "Shitzu",
		price: 206000,
		weightKG: 200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 148,
		model: "defiler",
		hash: 822018448,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 0.4050000011920929
	},
	{
		displayName: "Tropic",
		manufacturer: "Shitzu",
		price: 11000,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 63.25,
		gameMaxSpeedKPH: 115,
		model: "tropic",
		hash: 290013743,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 13
	},
	{
		displayName: "Tropic II",
		manufacturer: "Shitzu",
		price: 11000,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 63.25,
		gameMaxSpeedKPH: 115,
		model: "tropic2",
		hash: 1448677353,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 13
	},
	{
		displayName: "Suntrap",
		manufacturer: "Shitzu",
		price: 12580,
		weightKG: 2500,
		drivetrain: null,
		realMaxSpeedMPH: 51,
		gameMaxSpeedKPH: 110,
		model: "suntrap",
		hash: 4012021193,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 11.5
	},
	{
		displayName: "Squalo",
		manufacturer: "Shitzu",
		price: 98310.5,
		weightKG: 3000,
		drivetrain: null,
		realMaxSpeedMPH: 65.75,
		gameMaxSpeedKPH: 110,
		model: "squalo",
		hash: 400514754,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 11.5
	},
	{
		displayName: "Jetmax",
		manufacturer: "Shitzu",
		price: 149500,
		weightKG: 2000,
		drivetrain: null,
		realMaxSpeedMPH: 70,
		gameMaxSpeedKPH: 135,
		model: "jetmax",
		hash: 861409633,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 17
	},
	{
		displayName: "Seashark Lifeguard",
		manufacturer: "Speedophile",
		price: 8449.5,
		weightKG: 400,
		drivetrain: null,
		realMaxSpeedMPH: 67,
		gameMaxSpeedKPH: 130,
		model: "seashark2",
		hash: 3678636260,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 12.5
	},
	{
		displayName: "Seashark",
		manufacturer: "Speedophile",
		price: 8449.5,
		weightKG: 400,
		drivetrain: null,
		realMaxSpeedMPH: 67,
		gameMaxSpeedKPH: 130,
		model: "seashark",
		hash: 3264692260,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 12.5
	},
	{
		displayName: "Seashark II",
		manufacturer: "Speedophile",
		price: 8449.5,
		weightKG: 400,
		drivetrain: null,
		realMaxSpeedMPH: 67,
		gameMaxSpeedKPH: 130,
		model: "seashark3",
		hash: 3983945033,
		"class": {
			id: 14,
			name: "Boats"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.4000000059604645,
		maxTraction: 0,
		maxAcceleration: 12.5
	},
	{
		displayName: "Tractor",
		manufacturer: "Stanley",
		price: 100000,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 28.5,
		gameMaxSpeedKPH: 40,
		model: "tractor",
		hash: 1641462412,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 11.111111640930176,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.2000000476837158,
		maxAcceleration: 0.07999999821186066
	},
	{
		displayName: "Fieldmaster",
		manufacturer: "Stanley",
		price: 100000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 33.25,
		gameMaxSpeedKPH: 45,
		model: "tractor2",
		hash: 2218488798,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 12.500000953674316,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Fieldmaster II",
		manufacturer: "Stanley",
		price: 100000,
		weightKG: 6500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 33.25,
		gameMaxSpeedKPH: 45,
		model: "tractor3",
		hash: 1445631933,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 12.500000953674316,
		maxBraking: 0.30000001192092896,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Thrax",
		manufacturer: "Truffade",
		price: 1162500,
		weightKG: 1960,
		drivetrain: "AWD",
		realMaxSpeedMPH: 124,
		gameMaxSpeedKPH: 158.5,
		model: "thrax",
		hash: 1044193113,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.02777862548828,
		maxBraking: 1.2000000476837158,
		maxTraction: 33.183998107910156,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Nero Custom",
		manufacturer: "Truffade",
		price: 302500,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 127.25,
		gameMaxSpeedKPH: 160.2,
		model: "nero2",
		hash: 1093792632,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 44.5,
		maxBraking: 1.100000023841858,
		maxTraction: 2.674999952316284,
		maxAcceleration: 0.34005001187324524
	},
	{
		displayName: "Nero",
		manufacturer: "Truffade",
		price: 720000,
		weightKG: 1995,
		drivetrain: "AWD",
		realMaxSpeedMPH: 126.5,
		gameMaxSpeedKPH: 160,
		model: "nero",
		hash: 1034187331,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 1,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3375000059604645
	},
	{
		displayName: "Adder",
		manufacturer: "Truffade",
		price: 500000,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 124.75,
		gameMaxSpeedKPH: 160,
		model: "adder",
		hash: 3078201489,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.4444465637207,
		maxBraking: 1,
		maxTraction: 2.5,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Z-Type",
		manufacturer: "Truffade",
		price: 475000,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.25,
		gameMaxSpeedKPH: 154,
		model: "ztype",
		hash: 758895617,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.77777862548828,
		maxBraking: 0.699999988079071,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Rebla GTS",
		manufacturer: "Ubermacht",
		price: 587500,
		weightKG: 2185,
		drivetrain: "AWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 157.5,
		model: "rebla",
		hash: 83136452,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 43.750003814697266,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.194999933242798,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Zion Classic",
		manufacturer: "Ubermacht",
		price: 406000,
		weightKG: 1450,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.75,
		gameMaxSpeedKPH: 149,
		model: "zion3",
		hash: 1862507111,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.38888931274414,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.3050000071525574
	},
	{
		displayName: "Revolter",
		manufacturer: "Ubermacht",
		price: 805000,
		weightKG: 2600,
		drivetrain: "AWD",
		realMaxSpeedMPH: 115.5,
		gameMaxSpeedKPH: 140,
		model: "revolter",
		hash: 3884762073,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.3499999940395355
	},
	{
		displayName: "Sentinel Classic",
		manufacturer: "Ubermacht",
		price: 325000,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.25,
		gameMaxSpeedKPH: 140,
		model: "sentinel3",
		hash: 1104234922,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.26499998569488525
	},
	{
		displayName: "SC1",
		manufacturer: "Ubermacht",
		price: 801500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.75,
		gameMaxSpeedKPH: 159,
		model: "sc1",
		hash: 1352136073,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.16666793823242,
		maxBraking: 1.1200000047683716,
		maxTraction: 2.6500000953674316,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Zion Cabrio",
		manufacturer: "Ubermacht",
		price: 32500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 145,
		model: "zion2",
		hash: 3101863448,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Zion",
		manufacturer: "Ubermacht",
		price: 30000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117,
		gameMaxSpeedKPH: 145,
		model: "zion",
		hash: 3172678083,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.5999999046325684,
		maxAcceleration: 0.2199999988079071
	},
	{
		displayName: "Sentinel XS",
		manufacturer: "Ubermacht",
		price: 30000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.25,
		gameMaxSpeedKPH: 142,
		model: "sentinel",
		hash: 1349725314,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Sentinel",
		manufacturer: "Ubermacht",
		price: 47500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 112,
		gameMaxSpeedKPH: 142,
		model: "sentinel2",
		hash: 873639469,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Oracle XS",
		manufacturer: "Ubermacht",
		price: 41000,
		weightKG: 1850,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114,
		gameMaxSpeedKPH: 150,
		model: "oracle",
		hash: 1348744438,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.25,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Oracle",
		manufacturer: "Ubermacht",
		price: 40000,
		weightKG: 1900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 115,
		gameMaxSpeedKPH: 150,
		model: "oracle2",
		hash: 3783366066,
		"class": {
			id: 3,
			name: "Coupes"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.25,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Retinue MK II",
		manufacturer: "Vapid",
		price: 810000,
		weightKG: 950,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.5,
		gameMaxSpeedKPH: 145,
		model: "retinue2",
		hash: 2031587082,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.7200000286102295,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.2775000035762787
	},
	{
		displayName: "Nightmare Slamvan",
		manufacturer: "Vapid",
		price: 660937.5,
		weightKG: 1245,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121,
		gameMaxSpeedKPH: 135.5,
		model: "slamvan6",
		hash: 1742022738,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.63888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Nightmare Imperator",
		manufacturer: "Vapid",
		price: 1142470,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 132.75,
		gameMaxSpeedKPH: 150,
		model: "imperator3",
		hash: 3539435063,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Nightmare Dominator",
		manufacturer: "Vapid",
		price: 566000,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 131,
		gameMaxSpeedKPH: 150,
		model: "dominator6",
		hash: 3001042683,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.800000011920929,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.375
	},
	{
		displayName: "Future Shock Slamvan",
		manufacturer: "Vapid",
		price: 660937.5,
		weightKG: 1245,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121,
		gameMaxSpeedKPH: 135.5,
		model: "slamvan5",
		hash: 373261600,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.63888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Future Shock Imperator",
		manufacturer: "Vapid",
		price: 1142470,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 132.75,
		gameMaxSpeedKPH: 150,
		model: "imperator2",
		hash: 1637620610,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Future Shock Dominator",
		manufacturer: "Vapid",
		price: 566000,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 131,
		gameMaxSpeedKPH: 150,
		model: "dominator5",
		hash: 2919906639,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.800000011920929,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.375
	},
	{
		displayName: "Lost Slamvan",
		manufacturer: "Vapid",
		price: 170000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108,
		gameMaxSpeedKPH: 135,
		model: "slamvan2",
		hash: 833469436,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.699999988079071,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.25
	},
	{
		displayName: "Peyote Gasser",
		manufacturer: "Vapid",
		price: 402500,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118,
		gameMaxSpeedKPH: 148.5,
		model: "peyote2",
		hash: 2490551588,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.250003814697266,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.259999990463257,
		maxAcceleration: 0.34450000524520874
	},
	{
		displayName: "Caracara 4x4",
		manufacturer: "Vapid",
		price: 437500,
		weightKG: 2480,
		drivetrain: "AWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 138,
		model: "caracara2",
		hash: 2945871676,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.333335876464844,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Clique",
		manufacturer: "Vapid",
		price: 454500,
		weightKG: 1250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.5,
		gameMaxSpeedKPH: 150,
		model: "clique",
		hash: 2728360112,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.8500000238418579,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Apocalypse Imperator",
		manufacturer: "Vapid",
		price: 1142470,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 132.75,
		gameMaxSpeedKPH: 150,
		model: "imperator",
		hash: 444994115,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.5,
		maxTraction: 2.25,
		maxAcceleration: 0.36500000953674316
	},
	{
		displayName: "Apocalypse Slamvan",
		manufacturer: "Vapid",
		price: 660937.5,
		weightKG: 1245,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121,
		gameMaxSpeedKPH: 135.5,
		model: "slamvan4",
		hash: 2233918197,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.63888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Apocalypse Dominator",
		manufacturer: "Vapid",
		price: 566000,
		weightKG: 1550,
		drivetrain: "RWD",
		realMaxSpeedMPH: 131,
		gameMaxSpeedKPH: 150,
		model: "dominator4",
		hash: 3606777648,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 0.800000011920929,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.375
	},
	{
		displayName: "Speedo Custom",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 105,
		gameMaxSpeedKPH: 130,
		model: "speedo4",
		hash: 219613597,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6499999761581421,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Clown Van",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 94.75,
		gameMaxSpeedKPH: 130,
		model: "speedo2",
		hash: 728614474,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Dominator GTX",
		manufacturer: "Vapid",
		price: 362500,
		weightKG: 1670,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108.5,
		gameMaxSpeedKPH: 145.5,
		model: "dominator3",
		hash: 3308022675,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.41666793823242,
		maxBraking: 0.5,
		maxTraction: 2.569999933242798,
		maxAcceleration: 0.33500000834465027
	},
	{
		displayName: "Flash GT",
		manufacturer: "Vapid",
		price: 837500,
		weightKG: 1200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 116.25,
		gameMaxSpeedKPH: 152,
		model: "flashgt",
		hash: 3035832600,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 19.600000381469727,
		maxAcceleration: 0.3199999928474426
	},
	{
		displayName: "Caracara",
		manufacturer: "Vapid",
		price: 887500,
		weightKG: 3500,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100.75,
		gameMaxSpeedKPH: 135,
		model: "caracara",
		hash: 1254014755,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 5,
		maxPassengers: 4,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.27000001072883606,
		maxTraction: 2.25,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Ellie",
		manufacturer: "Vapid",
		price: 282500,
		weightKG: 1370,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 140.5,
		model: "ellie",
		hash: 3027423925,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.02777862548828,
		maxBraking: 0.5,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.32499998807907104
	},
	{
		displayName: "GB200",
		manufacturer: "Vapid",
		price: 470000,
		weightKG: 1180,
		drivetrain: "AWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 152,
		model: "gb200",
		hash: 1909189272,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 1,
		maxTraction: 14.375,
		maxAcceleration: 0.3149999976158142
	},
	{
		displayName: "Hustler",
		manufacturer: "Vapid",
		price: 312500,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 121.25,
		gameMaxSpeedKPH: 140,
		model: "hustler",
		hash: 600450546,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.4300000071525574,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Riata",
		manufacturer: "Vapid",
		price: 190000,
		weightKG: 2300,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104,
		gameMaxSpeedKPH: 135,
		model: "riata",
		hash: 2762269779,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.25
	},
	{
		displayName: "Speedo",
		manufacturer: "Vapid",
		price: 110000,
		weightKG: 2500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 94.75,
		gameMaxSpeedKPH: 130,
		model: "speedo",
		hash: 3484649228,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.7999999523162842,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Minivan Custom",
		manufacturer: "Vapid",
		price: 165000,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 95.5,
		gameMaxSpeedKPH: 125,
		model: "minivan2",
		hash: 3168702960,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.44999998807907104,
		maxTraction: 1.9249999523162842,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Minivan",
		manufacturer: "Vapid",
		price: 15000,
		weightKG: 2000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 94.75,
		gameMaxSpeedKPH: 125,
		model: "minivan",
		hash: 3984502180,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Bobcat XL",
		manufacturer: "Vapid",
		price: 11500,
		weightKG: 2600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 95.5,
		gameMaxSpeedKPH: 130,
		model: "bobcatxl",
		hash: 1069929536,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.800000011920929,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Utility Truck (Contender)",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 3500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 77,
		gameMaxSpeedKPH: 115,
		model: "utillitruck3",
		hash: 2132890591,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 31.944446563720703,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.11999999731779099
	},
	{
		displayName: "Tow Truck (Large)",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 81.75,
		gameMaxSpeedKPH: 105,
		model: "towtruck",
		hash: 2971866336,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 29.166667938232422,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Tow Truck",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 85.75,
		gameMaxSpeedKPH: 100,
		model: "towtruck2",
		hash: 3852654278,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.4500000476837158,
		maxAcceleration: 0.15000000596046448
	},
	{
		displayName: "Scrap Truck",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 77.75,
		gameMaxSpeedKPH: 105,
		model: "scrap",
		hash: 2594165727,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 29.166667938232422,
		maxBraking: 0.25,
		maxTraction: 1.600000023841858,
		maxAcceleration: 0.12999999523162842
	},
	{
		displayName: "Sadler",
		manufacturer: "Vapid",
		price: 17500,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 130,
		model: "sadler",
		hash: 3695398481,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Sadler II",
		manufacturer: "Vapid",
		price: 17500,
		weightKG: 2100,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100,
		gameMaxSpeedKPH: 130,
		model: "sadler2",
		hash: 734217681,
		"class": {
			id: 11,
			name: "Utility"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Radius",
		manufacturer: "Vapid",
		price: 16000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104.5,
		gameMaxSpeedKPH: 140,
		model: "radi",
		hash: 2643899483,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Contender",
		manufacturer: "Vapid",
		price: 125000,
		weightKG: 2750,
		drivetrain: "AWD",
		realMaxSpeedMPH: 109,
		gameMaxSpeedKPH: 135,
		model: "contender",
		hash: 683047626,
		"class": {
			id: 2,
			name: "SUVs"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "FMJ",
		manufacturer: "Vapid",
		price: 875000,
		weightKG: 1315,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125,
		gameMaxSpeedKPH: 158.4,
		model: "fmj",
		hash: 1426219628,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44,
		maxBraking: 1.100000023841858,
		maxTraction: 2.700000047683716,
		maxAcceleration: 0.36550000309944153
	},
	{
		displayName: "Bullet",
		manufacturer: "Vapid",
		price: 77500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 118.75,
		gameMaxSpeedKPH: 152,
		model: "bullet",
		hash: 2598821281,
		"class": {
			id: 7,
			name: "Super"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 42.222225189208984,
		maxBraking: 0.800000011920929,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.33000001311302185
	},
	{
		displayName: "Retinue",
		manufacturer: "Vapid",
		price: 307500,
		weightKG: 900,
		drivetrain: "RWD",
		realMaxSpeedMPH: 116.5,
		gameMaxSpeedKPH: 140,
		model: "retinue",
		hash: 1841130506,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.699999988079071,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.22750000655651093
	},
	{
		displayName: "Peyote",
		manufacturer: "Vapid",
		price: 80000,
		weightKG: 2100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98.25,
		gameMaxSpeedKPH: 130,
		model: "peyote",
		hash: 1830407356,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Taxi",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102,
		gameMaxSpeedKPH: 143,
		model: "taxi",
		hash: 3338918751,
		"class": {
			id: 17,
			name: "Service"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 39.722225189208984,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Stanier",
		manufacturer: "Vapid",
		price: 5000,
		weightKG: 1800,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108,
		gameMaxSpeedKPH: 140,
		model: "stanier",
		hash: 2817386317,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.450000047683716,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Trophy Truck",
		manufacturer: "Vapid",
		price: 275000,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 107,
		gameMaxSpeedKPH: 140,
		model: "trophytruck",
		hash: 101905590,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.5,
		maxAcceleration: 0.33899998664855957
	},
	{
		displayName: "Liberator",
		manufacturer: "Vapid",
		price: 278255.5,
		weightKG: 4000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 80.25,
		gameMaxSpeedKPH: 110,
		model: "monster",
		hash: 3449006043,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 30.555557250976562,
		maxBraking: 0.6499999761581421,
		maxTraction: 2.25,
		maxAcceleration: 0.4000000059604645
	},
	{
		displayName: "Sandking XL",
		manufacturer: "Vapid",
		price: 22500,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99,
		gameMaxSpeedKPH: 130,
		model: "sandking",
		hash: 3105951696,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Sandking SWB",
		manufacturer: "Vapid",
		price: 19000,
		weightKG: 2400,
		drivetrain: "AWD",
		realMaxSpeedMPH: 99,
		gameMaxSpeedKPH: 130,
		model: "sandking2",
		hash: 989381445,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Desert Raid",
		manufacturer: "Vapid",
		price: 347500,
		weightKG: 2200,
		drivetrain: "AWD",
		realMaxSpeedMPH: 106.5,
		gameMaxSpeedKPH: 140,
		model: "trophytruck2",
		hash: 3631668194,
		"class": {
			id: 9,
			name: "Off-road"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.30000001192092896,
		maxTraction: 2.5,
		maxAcceleration: 0.33899998664855957
	},
	{
		displayName: "Slamvan Custom",
		manufacturer: "Vapid",
		price: 197125,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 117.5,
		gameMaxSpeedKPH: 135,
		model: "slamvan3",
		hash: 1119641113,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.25
	},
	{
		displayName: "Slamvan",
		manufacturer: "Vapid",
		price: 24750,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 108,
		gameMaxSpeedKPH: 135,
		model: "slamvan",
		hash: 729783779,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.24500000476837158
	},
	{
		displayName: "Hotknife",
		manufacturer: "Vapid",
		price: 45000,
		weightKG: 700,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.5,
		gameMaxSpeedKPH: 140,
		model: "hotknife",
		hash: 37348240,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.4300000071525574,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Pißwasser Dominator",
		manufacturer: "Vapid",
		price: 157500,
		weightKG: 1500,
		drivetrain: "RWD",
		realMaxSpeedMPH: 126.5,
		gameMaxSpeedKPH: 147,
		model: "dominator2",
		hash: 3379262425,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.299999952316284,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Dominator",
		manufacturer: "Vapid",
		price: 17500,
		weightKG: 1600,
		drivetrain: "RWD",
		realMaxSpeedMPH: 120.25,
		gameMaxSpeedKPH: 145,
		model: "dominator",
		hash: 80636076,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Chino Custom",
		manufacturer: "Vapid",
		price: 90000,
		weightKG: 2400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 95.5,
		gameMaxSpeedKPH: 130,
		model: "chino2",
		hash: 2933279331,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.069999933242798,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Chino",
		manufacturer: "Vapid",
		price: 112500,
		weightKG: 2300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 94.25,
		gameMaxSpeedKPH: 130,
		model: "chino",
		hash: 349605904,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Blade",
		manufacturer: "Vapid",
		price: 80000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.75,
		gameMaxSpeedKPH: 145,
		model: "blade",
		hash: 3089165662,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.800000011920929,
		maxTraction: 2.2300000190734863,
		maxAcceleration: 0.3240000009536743
	},
	{
		displayName: "Guardian",
		manufacturer: "Vapid",
		price: 187500,
		weightKG: 3800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 100.5,
		gameMaxSpeedKPH: 130,
		model: "guardian",
		hash: 2186977100,
		"class": {
			id: 10,
			name: "Industrial"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.6000000238418579,
		maxTraction: 2,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Unmarked Cruiser",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102.75,
		gameMaxSpeedKPH: 145,
		model: "police4",
		hash: 2321795001,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Sheriff Cruiser",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 101.75,
		gameMaxSpeedKPH: 145,
		model: "sheriff",
		hash: 2611638396,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.25,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Police Prison Bus",
		manufacturer: "Vapid",
		price: 365750,
		weightKG: 9000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 65.25,
		gameMaxSpeedKPH: 90,
		model: "pbus",
		hash: 2287941233,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 11,
		maxPassengers: 10,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 25.000001907348633,
		maxBraking: 0.25,
		maxTraction: 1.350000023841858,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Police Cruiser (Interceptor)",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 1450,
		drivetrain: "RWD",
		realMaxSpeedMPH: 109.25,
		gameMaxSpeedKPH: 150,
		model: "police3",
		hash: 1912215274,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 41.66666793823242,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.569999933242798,
		maxAcceleration: 0.30000001192092896
	},
	{
		displayName: "Police Cruiser",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 102.75,
		gameMaxSpeedKPH: 145,
		model: "police",
		hash: 2046537925,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.27777862548828,
		maxBraking: 0.8999999761581421,
		maxTraction: 2.549999952316284,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Benson",
		manufacturer: "Vapid",
		price: 100000,
		weightKG: 7000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 89.75,
		gameMaxSpeedKPH: 130,
		model: "benson",
		hash: 2053223216,
		"class": {
			id: 20,
			name: "Commercial"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 0.25,
		maxTraction: 1.75,
		maxAcceleration: 0.1599999964237213
	},
	{
		displayName: "Anti-Aircraft Trailer",
		manufacturer: "Vom Feuer",
		price: 931000,
		weightKG: 1000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 88.25,
		gameMaxSpeedKPH: null,
		model: "trailersmall2",
		hash: 2413121211,
		"class": {
			id: 19,
			name: "Military"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 29.166667938232422,
		maxBraking: 0.699999988079071,
		maxTraction: 3.700000047683716,
		maxAcceleration: 0
	},
	{
		displayName: "Nebula Turbo",
		manufacturer: "Vulcar",
		price: 398500,
		weightKG: 1320,
		drivetrain: "RWD",
		realMaxSpeedMPH: 101,
		gameMaxSpeedKPH: 138,
		model: "nebula",
		hash: 3412338231,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.333335876464844,
		maxBraking: 0.5,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.23999999463558197
	},
	{
		displayName: "Fagaloa",
		manufacturer: "Vulcar",
		price: 167500,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 87.5,
		gameMaxSpeedKPH: 120,
		model: "fagaloa",
		hash: 1617472902,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 33.333335876464844,
		maxBraking: 0.7749999761581421,
		maxTraction: 2.375,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Warrener",
		manufacturer: "Vulcar",
		price: 60000,
		weightKG: 1300,
		drivetrain: "RWD",
		realMaxSpeedMPH: 103.25,
		gameMaxSpeedKPH: 140,
		model: "warrener",
		hash: 1373123368,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.949999988079071,
		maxTraction: 2.1600000858306885,
		maxAcceleration: 0.24500000476837158
	},
	{
		displayName: "Ingot",
		manufacturer: "Vulcar",
		price: 4500,
		weightKG: 1400,
		drivetrain: "FWD",
		realMaxSpeedMPH: 90,
		gameMaxSpeedKPH: 125,
		model: "ingot",
		hash: 3005245074,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.14000000059604645
	},
	{
		displayName: "Neo",
		manufacturer: "Vysser",
		price: 937500,
		weightKG: 1390,
		drivetrain: "AWD",
		realMaxSpeedMPH: 125.75,
		gameMaxSpeedKPH: 160.85,
		model: "neo",
		hash: 2674840994,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 44.68056106567383,
		maxBraking: 1.2000000476837158,
		maxTraction: 2.619999885559082,
		maxAcceleration: 0.3869999945163727
	},
	{
		displayName: "Nightmare Issi",
		manufacturer: "Weeny",
		price: 544500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 140,
		model: "issi6",
		hash: 1239571361,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Future Shock Issi",
		manufacturer: "Weeny",
		price: 544500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 140,
		model: "issi5",
		hash: 1537277726,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Dynasty",
		manufacturer: "Weeny",
		price: 225000,
		weightKG: 1100,
		drivetrain: "RWD",
		realMaxSpeedMPH: 93.5,
		gameMaxSpeedKPH: 118,
		model: "dynasty",
		hash: 310284501,
		"class": {
			id: 5,
			name: "Sports Classics"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 32.77777862548828,
		maxBraking: 0.4000000059604645,
		maxTraction: 1.7000000476837158,
		maxAcceleration: 0.18000000715255737
	},
	{
		displayName: "Issi Sport",
		manufacturer: "Weeny",
		price: 448500,
		weightKG: 1000,
		drivetrain: "AWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 148,
		model: "issi7",
		hash: 1854776567,
		"class": {
			id: 6,
			name: "Sports"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 41.111114501953125,
		maxBraking: 1,
		maxTraction: 20.399999618530273,
		maxAcceleration: 0.3050000071525574
	},
	{
		displayName: "Apocalypse Issi",
		manufacturer: "Weeny",
		price: 544500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.25,
		gameMaxSpeedKPH: 140,
		model: "issi4",
		hash: 628003514,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.4000000059604645,
		maxTraction: 2,
		maxAcceleration: 0.3400000035762787
	},
	{
		displayName: "Issi Classic",
		manufacturer: "Weeny",
		price: 180000,
		weightKG: 650,
		drivetrain: "FWD",
		realMaxSpeedMPH: 95.25,
		gameMaxSpeedKPH: 125,
		model: "issi3",
		hash: 931280609,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 34.722225189208984,
		maxBraking: 0.30000001192092896,
		maxTraction: 2,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Issi",
		manufacturer: "Weeny",
		price: 9000,
		weightKG: 1200,
		drivetrain: "FWD",
		realMaxSpeedMPH: 104.25,
		gameMaxSpeedKPH: 135,
		model: "issi2",
		hash: 3117103977,
		"class": {
			id: 0,
			name: "Compacts"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.23000000417232513
	},
	{
		displayName: "Nightmare Deathbike",
		manufacturer: "Western",
		price: 634500,
		weightKG: 135,
		drivetrain: "RWD",
		realMaxSpeedMPH: 150,
		gameMaxSpeedKPH: 147,
		model: "deathbike3",
		hash: 2920466844,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1.100000023841858,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.3125
	},
	{
		displayName: "Future Shock Deathbike",
		manufacturer: "Western",
		price: 634500,
		weightKG: 135,
		drivetrain: "RWD",
		realMaxSpeedMPH: 150,
		gameMaxSpeedKPH: 147,
		model: "deathbike2",
		hash: 2482017624,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1.100000023841858,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.3125
	},
	{
		displayName: "Rampant Rocket Tricycle",
		manufacturer: "Western",
		price: 462500,
		weightKG: 1140,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106,
		gameMaxSpeedKPH: 142,
		model: "rrocket",
		hash: 916547552,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 1,
		maxTraction: 2.0999999046325684,
		maxAcceleration: 0.38199999928474426
	},
	{
		displayName: "Apocalypse Deathbike",
		manufacturer: "Western",
		price: 634500,
		weightKG: 135,
		drivetrain: "RWD",
		realMaxSpeedMPH: 150,
		gameMaxSpeedKPH: 147,
		model: "deathbike",
		hash: 4267640610,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1.100000023841858,
		maxTraction: 2.049999952316284,
		maxAcceleration: 0.3125
	},
	{
		displayName: "Zombie Chopper",
		manufacturer: "Western",
		price: 61000,
		weightKG: 225,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.75,
		gameMaxSpeedKPH: 137,
		model: "zombieb",
		hash: 3724934023,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 1.875,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Zombie Bobber",
		manufacturer: "Western",
		price: 49500,
		weightKG: 225,
		drivetrain: "RWD",
		realMaxSpeedMPH: 113.75,
		gameMaxSpeedKPH: 137,
		model: "zombiea",
		hash: 3285698347,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.05555725097656,
		maxBraking: 0.800000011920929,
		maxTraction: 1.875,
		maxAcceleration: 0.28999999165534973
	},
	{
		displayName: "Wolfsbane",
		manufacturer: "Western",
		price: 47500,
		weightKG: 180,
		drivetrain: "RWD",
		realMaxSpeedMPH: 101.5,
		gameMaxSpeedKPH: 130,
		model: "wolfsbane",
		hash: 3676349299,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.2150000035762787
	},
	{
		displayName: "Sovereign",
		manufacturer: "Western",
		price: 45000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 106.25,
		gameMaxSpeedKPH: 135,
		model: "sovereign",
		hash: 743478836,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1.100000023841858,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Rat Bike",
		manufacturer: "Western",
		price: 24000,
		weightKG: 180,
		drivetrain: "RWD",
		realMaxSpeedMPH: 123.5,
		gameMaxSpeedKPH: 130,
		model: "ratbike",
		hash: 1873600305,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.2150000035762787
	},
	{
		displayName: "Nightblade",
		manufacturer: "Western",
		price: 50000,
		weightKG: 205,
		drivetrain: "RWD",
		realMaxSpeedMPH: 114.25,
		gameMaxSpeedKPH: 142,
		model: "nightblade",
		hash: 2688780135,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 39.4444465637207,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.9500000476837158,
		maxAcceleration: 0.3100000023841858
	},
	{
		displayName: "Gargoyle",
		manufacturer: "Western",
		price: 60000,
		weightKG: 135,
		drivetrain: "RWD",
		realMaxSpeedMPH: 125,
		gameMaxSpeedKPH: 147,
		model: "gargoyle",
		hash: 741090084,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.833335876464844,
		maxBraking: 1.100000023841858,
		maxTraction: 2.25,
		maxAcceleration: 0.3125
	},
	{
		displayName: "Daemon Custom",
		manufacturer: "Western",
		price: 72500,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107,
		gameMaxSpeedKPH: 135,
		model: "daemon2",
		hash: 2890830793,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.2619999945163727
	},
	{
		displayName: "Daemon",
		manufacturer: "Western",
		price: 100000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 107,
		gameMaxSpeedKPH: 135,
		model: "daemon",
		hash: 2006142190,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 1.850000023841858,
		maxAcceleration: 0.25999999046325684
	},
	{
		displayName: "Cliffhanger",
		manufacturer: "Western",
		price: 112500,
		weightKG: 140,
		drivetrain: "RWD",
		realMaxSpeedMPH: 124.75,
		gameMaxSpeedKPH: 147.5,
		model: "cliffhanger",
		hash: 390201602,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 40.972225189208984,
		maxBraking: 1.100000023841858,
		maxTraction: 2.25,
		maxAcceleration: 0.3179999887943268
	},
	{
		displayName: "Bagger",
		manufacturer: "Western",
		price: 8000,
		weightKG: 230,
		drivetrain: "RWD",
		realMaxSpeedMPH: 98,
		gameMaxSpeedKPH: 130,
		model: "bagger",
		hash: 2154536131,
		"class": {
			id: 8,
			name: "Motorcycles"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 36.111114501953125,
		maxBraking: 1.2000000476837158,
		maxTraction: 1.649999976158142,
		maxAcceleration: 0.20999999344348907
	},
	{
		displayName: "Police Bike",
		manufacturer: "Western",
		price: 100000,
		weightKG: 250,
		drivetrain: "RWD",
		realMaxSpeedMPH: 100.5,
		gameMaxSpeedKPH: 135,
		model: "policeb",
		hash: 4260343491,
		"class": {
			id: 18,
			name: "Emergency"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 1.100000023841858,
		maxTraction: 1.899999976158142,
		maxAcceleration: 0.27000001072883606
	},
	{
		displayName: "Cargobob Jetsam",
		manufacturer: "Western Company",
		price: 997500,
		weightKG: 15000,
		drivetrain: null,
		realMaxSpeedMPH: 99.5,
		gameMaxSpeedKPH: 160,
		model: "cargobob2",
		hash: 1621617168,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 49.919960021972656,
		maxBraking: 2.494999647140503,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.998000144958496
	},
	{
		displayName: "Seabreeze",
		manufacturer: "Western Company",
		price: 565250,
		weightKG: 3000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 191.75,
		gameMaxSpeedKPH: 328.6,
		model: "seabreeze",
		hash: 3902291871,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 81.649658203125,
		maxBraking: 16.40341567993164,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 20.09000015258789
	},
	{
		displayName: "Rogue",
		manufacturer: "Western Company",
		price: 798000,
		weightKG: 4200,
		drivetrain: "FWD",
		realMaxSpeedMPH: 219.5,
		gameMaxSpeedKPH: 328.6,
		model: "rogue",
		hash: 3319621991,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 100,
		maxBraking: 9.800000190734863,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 9.800000190734863
	},
	{
		displayName: "Mallard",
		manufacturer: "Western Company",
		price: 125000,
		weightKG: 1000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 140.25,
		gameMaxSpeedKPH: 284.4,
		model: "stunt",
		hash: 2172210288,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 79.05693817138672,
		maxBraking: 7.747579574584961,
		maxTraction: 1.149999976158142,
		maxAcceleration: 9.800000190734863
	},
	{
		displayName: "Duster",
		manufacturer: "Western Company",
		price: 137500,
		weightKG: 2000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 144,
		gameMaxSpeedKPH: 249.8,
		model: "duster",
		hash: 970356638,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 69.36756134033203,
		maxBraking: 3.39901065826416,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 4.900000095367432
	},
	{
		displayName: "Cuban 800",
		manufacturer: "Western Company",
		price: 120000,
		weightKG: 5000,
		drivetrain: "RWD",
		realMaxSpeedMPH: 142,
		gameMaxSpeedKPH: 276.5,
		model: "cuban800",
		hash: 3650256867,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 76.79570770263672,
		maxBraking: 4.51558780670166,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 5.880000114440918
	},
	{
		displayName: "Besra",
		manufacturer: "Western Company",
		price: 575000,
		weightKG: 8000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 189.25,
		gameMaxSpeedKPH: 328.6,
		model: "besra",
		hash: 1824333165,
		"class": {
			id: 16,
			name: "Planes"
		},
		seats: 1,
		maxPassengers: 0,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 87.70580291748047,
		maxBraking: 18.4796142578125,
		maxTraction: 2.1500000953674316,
		maxAcceleration: 21.07000160217285
	},
	{
		displayName: "Cargobob",
		manufacturer: "Western Company",
		price: 895000,
		weightKG: 15000,
		drivetrain: null,
		realMaxSpeedMPH: 99.5,
		gameMaxSpeedKPH: 160,
		model: "cargobob",
		hash: 4244420235,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 49.919960021972656,
		maxBraking: 2.494999647140503,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.998000144958496
	},
	{
		displayName: "Cargobob II",
		manufacturer: "Western Company",
		price: 895000,
		weightKG: 15000,
		drivetrain: null,
		realMaxSpeedMPH: 99.5,
		gameMaxSpeedKPH: 160,
		model: "cargobob3",
		hash: 1394036463,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 10,
		maxPassengers: 9,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 49.919960021972656,
		maxBraking: 2.494999647140503,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.998000144958496
	},
	{
		displayName: "Cargobob III",
		manufacturer: "Western Company",
		price: 895000,
		weightKG: 15000,
		drivetrain: null,
		realMaxSpeedMPH: 99.5,
		gameMaxSpeedKPH: 160,
		model: "cargobob4",
		hash: 2025593404,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 49.919960021972656,
		maxBraking: 2.494999647140503,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.998000144958496
	},
	{
		displayName: "Annihilator",
		manufacturer: "Western Company",
		price: 912500,
		weightKG: 13000,
		drivetrain: null,
		realMaxSpeedMPH: 115.25,
		gameMaxSpeedKPH: 160,
		model: "annihilator",
		hash: 837858166,
		"class": {
			id: 15,
			name: "Helicopters"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: false,
		stock: 200,
		estimatedMaxSpeed: 47.25648880004883,
		maxBraking: 2.176633834838867,
		maxTraction: 1.2999999523162842,
		maxAcceleration: 4.605999946594238
	},
	{
		displayName: "Faction Custom Donk",
		manufacturer: "Willard",
		price: 347500,
		weightKG: 1400,
		drivetrain: "RWD",
		realMaxSpeedMPH: 97.5,
		gameMaxSpeedKPH: 140,
		model: "faction3",
		hash: 2255212070,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.3499999046325684,
		maxAcceleration: 0.20000000298023224
	},
	{
		displayName: "Faction Custom",
		manufacturer: "Willard",
		price: 167500,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.75,
		gameMaxSpeedKPH: 140,
		model: "faction2",
		hash: 2504420315,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Faction",
		manufacturer: "Willard",
		price: 18000,
		weightKG: 1200,
		drivetrain: "RWD",
		realMaxSpeedMPH: 110.75,
		gameMaxSpeedKPH: 140,
		model: "faction",
		hash: 2175389151,
		"class": {
			id: 4,
			name: "Muscle"
		},
		seats: 2,
		maxPassengers: 1,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 38.88888931274414,
		maxBraking: 0.800000011920929,
		maxTraction: 2.25,
		maxAcceleration: 0.2800000011920929
	},
	{
		displayName: "Journey",
		manufacturer: "Zirconium",
		price: 7500,
		weightKG: 4000,
		drivetrain: "FWD",
		realMaxSpeedMPH: 74.25,
		gameMaxSpeedKPH: 100,
		model: "journey",
		hash: 4174679674,
		"class": {
			id: 12,
			name: "Vans"
		},
		seats: 6,
		maxPassengers: 5,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 27.77777862548828,
		maxBraking: 0.25,
		maxTraction: 1.399999976158142,
		maxAcceleration: 0.12999999523162842
	},
	{
		displayName: "Stratum",
		manufacturer: "Zirconium",
		price: 5000,
		weightKG: 1800,
		drivetrain: "AWD",
		realMaxSpeedMPH: 104.75,
		gameMaxSpeedKPH: 135,
		model: "stratum",
		hash: 1723137093,
		"class": {
			id: 1,
			name: "Sedans"
		},
		seats: 4,
		maxPassengers: 3,
		inDealership: true,
		stock: 200,
		estimatedMaxSpeed: 37.5,
		maxBraking: 0.6000000238418579,
		maxTraction: 2.200000047683716,
		maxAcceleration: 0.20999999344348907
	}
];

class VehicleDealerShips {
    static LocalPlayer;
    static _dealershipIdentifer = 'vehicleDealership';
    static _viewDealerEvent = 'server:viewDealerVehicles';
    static _closeDealerEvent = 'server:closeDealership';
    static _dealerPurchaseEvent = 'server:purchaseVehicle';
    static dealerCam;
    static dealerCamPos = new mp.Vector3(234.7, -997.9, -98.2);
    static dealerSelectedVehicle;
    static defaultSpawnColour = 111;
    constructor() {
        VehicleDealerShips.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.Y, false, VehicleDealerShips.handleKeyPress);
        mp.events.add('dealers:initDealership', VehicleDealerShips.initDealership);
        mp.events.add('dealers:closeDealership', VehicleDealerShips.closeDealerShip);
        mp.events.add('dealers:changeSelectVeh', VehicleDealerShips.addDealerShipVehicle);
        mp.events.add('dealers:setSelectedVehRot', VehicleDealerShips.setDealerVehRot);
        mp.events.add('dealers:changeSelectVehColour', VehicleDealerShips.setDealerVehColour);
        mp.events.add('dealers:purchaseVehicle', VehicleDealerShips.purchaseDealerVehicle);
        mp.events.add('render', VehicleDealerShips.handleRender);
    }
    static handleRender() {
        if (VehicleDealerShips.LocalPlayer.browserRouter == Browsers.Dealership) {
            DeathSystem.disableControls();
            mp.gui.cursor.show(true, true);
        }
    }
    static handleKeyPress() {
        if (!validateKeyPress(true) || mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE))
            return;
        let dealerData = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);
        if (dealerData) {
            mp.events.callRemote(VehicleDealerShips._viewDealerEvent);
        }
    }
    static closeDealerShip() {
        let dealerData = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);
        if (dealerData) {
            mp.events.callRemote(VehicleDealerShips._closeDealerEvent);
            if (VehicleDealerShips.dealerCam && mp.game.cam.doesExist(VehicleDealerShips.dealerCam.handle)) {
                VehicleDealerShips.dealerCam.destroy();
                mp.game.cam.renderScriptCams(false, false, 0, false, false);
                mp.game.invoke(CLEAR_FOCUS);
            }
            mp.gui.cursor.show(false, false);
            GuiSystem.toggleHudComplete(true);
        }
    }
    static async initDealership() {
        if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE))
            return;
        let dealerData = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);
        if (dealerData) {
            GuiSystem.toggleHudComplete(false);
            mp.game.cam.doScreenFadeOut(0);
            VehicleDealerShips.LocalPlayer.position = new mp.Vector3(230.7, -997.9, -98.2);
            VehicleDealerShips.dealerCam = mp.cameras.new('default', VehicleDealerShips.dealerCamPos, new mp.Vector3(0, 0, 0), 40);
            VehicleDealerShips.dealerCam.pointAtCoord(227.5, -987.2, -99);
            mp.game.cam.renderScriptCams(true, false, 0, true, false);
            if (dealerData.vehicles.length > 0) {
                VehicleDealerShips.addDealerShipVehicle(dealerData.vehicles[0].spawnName, 180, VehicleDealerShips.defaultSpawnColour);
            }
            dealerData.vehDispNames = [];
            dealerData.vehicles.forEach((data) => {
                let dispName = mp.game.vehicle.getDisplayNameFromVehicleModel(mp.game.joaat(data.spawnName));
                dealerData?.vehDispNames.push(dispName);
            });
            BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
                _mutationKey: "vehicle_dealer_data",
                data: ${JSON.stringify(dealerData)}
            })`);
            await mp.game.waitAsync(1300);
            mp.game.cam.doScreenFadeIn(600);
            BrowserSystem.pushRouter(Browsers.Dealership);
        }
    }
    static setDealerVehRot(rotation) {
        if (VehicleDealerShips.dealerSelectedVehicle) {
            VehicleDealerShips.dealerSelectedVehicle.setHeading(Number(rotation));
        }
    }
    static setDealerVehColour(colour) {
        if (VehicleDealerShips.dealerSelectedVehicle) {
            VehicleDealerShips.dealerSelectedVehicle.setColours(Number(colour), Number(colour));
        }
    }
    static insertPerformanceToBrowser(vehSpawnName) {
        let vehiclePerformanceData;
        vehicleData.forEach((data) => {
            if (data.model == vehSpawnName) {
                vehiclePerformanceData = data;
            }
        });
        BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
			_mutationKey: "vehicle_performance_data",
			data: ${JSON.stringify(vehiclePerformanceData)}
		})`);
    }
    static async addDealerShipVehicle(vehName, rotation, colour) {
        if (!vehName)
            return;
        let spawnHash = mp.game.joaat(vehName);
        VehicleDealerShips.insertPerformanceToBrowser(vehName);
        if (VehicleDealerShips.dealerSelectedVehicle && VehicleDealerShips.dealerSelectedVehicle.model == spawnHash)
            return;
        if (VehicleDealerShips.dealerSelectedVehicle) {
            VehicleDealerShips.dealerSelectedVehicle.destroy();
        }
        VehicleDealerShips.dealerSelectedVehicle = mp.vehicles.new(spawnHash, new mp.Vector3(227.5, -987.2, -99), {
            heading: -127,
            numberPlate: 'DEALER',
            locked: true,
            engine: false,
            dimension: VehicleDealerShips.LocalPlayer.remoteId + 1
        });
        for (let i = 0; VehicleDealerShips.dealerSelectedVehicle.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        VehicleDealerShips.dealerSelectedVehicle.setDirtLevel(0);
        VehicleDealerShips.dealerSelectedVehicle.setHeading(Number(rotation));
        VehicleDealerShips.dealerSelectedVehicle.setColours(Number(colour), Number(colour));
    }
    static purchaseDealerVehicle(vehName, spawnColour) {
        if (!vehName)
            return;
        mp.events.callRemote(VehicleDealerShips._dealerPurchaseEvent, vehName, Number(spawnColour));
    }
}

class HousingSystem {
    static _housingDataIdentifier = 'houseData';
    static _interiorDataIdentifier = 'houseInteriorData';
    static _houseLoadEvent = 'server:loadHouseForPlayer';
    static _houseExitEvent = 'server:exitHouseForPlayer';
    static _houseLockToggleEvent = 'server:toggleHouseLock';
    static LocalPlayer;
    constructor() {
        HousingSystem.LocalPlayer = mp.players.local;
        mp.events.add("housing:createObject", HousingSystem.createAnObject);
        mp.keys.bind(_control_ids.Y, false, HousingSystem.handleKeyPress_Y);
        mp.keys.bind(_control_ids.K, false, HousingSystem.handleKeyPress_K);
    }
    static async handleKeyPress_K() {
        let houseData = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
        let characterData = getUserCharacterData();
        let interiorData = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);
        if (!characterData)
            return;
        if ((houseData && houseData.house_owner_id == characterData.character_id) || interiorData) {
            mp.events.callRemote(HousingSystem._houseLockToggleEvent);
        }
    }
    static async handleKeyPress_Y() {
        if (!validateKeyPress(true))
            return;
        let houseData = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
        let interiorData = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);
        if (interiorData && !houseData) {
            mp.events.callRemote(HousingSystem._houseExitEvent);
            await HousingSystem.playSwitch('~o~You exited this house.');
        }
        if (houseData && houseData.isLocked) {
            NotificationSystem.createNotification('~r~This house is locked', false);
            return;
        }
        if (houseData) {
            mp.events.callRemote(HousingSystem._houseLoadEvent);
            await HousingSystem.playSwitch('~o~You entered this house');
        }
    }
    static async playSwitch(notif) {
        GuiSystem.toggleHudComplete(false);
        mp.game.cam.doScreenFadeOut(100);
        await mp.game.waitAsync(1500);
        mp.game.cam.doScreenFadeIn(500);
        GuiSystem.toggleHudComplete(true);
        NotificationSystem.createNotification(notif, false);
    }
    static createAnObject(model) {
        let pos = HousingSystem.LocalPlayer.position;
        mp.objects.new(model, pos, {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: 0
        });
    }
}

class VehicleRefueling {
    static LocalPlayer;
    static _refuelPumpIdenfitier = 'refuelingPumpData';
    static _refuelServerEvent = 'server:refuelVehicleCycle';
    static _startRefuelEvent = 'server:startRefuelEvent';
    static _stopRefuelEvent = 'server:stopRefuellingVehicle';
    static refuelInterval;
    static _refuelInterval_seconds = 1.5;
    static _refuelDataIdentifier = "playerRefuelData";
    constructor() {
        VehicleRefueling.LocalPlayer = mp.players.local;
        mp.events.add("entityStreamIn", VehicleRefueling.handleEntityStreamIn);
        mp.events.add('refuel:closeRefuelInterval', VehicleRefueling.endRefuelling);
        mp.events.add('refuel:startRefuelInterval', VehicleRefueling.startRefuelInterval);
        mp.keys.bind(_control_ids.Y, true, VehicleRefueling.handleKeyPress_Y);
        mp.events.addDataHandler(VehicleRefueling._refuelDataIdentifier, VehicleRefueling.handleRefuellingDataHandler);
    }
    static handleKeyPress_Y() {
        if (!validateKeyPress(true))
            return;
        let refuelStationData = VehicleRefueling.LocalPlayer.getVariable(VehicleRefueling._refuelPumpIdenfitier);
        if (refuelStationData) {
            VehicleRefueling.endRefuelling(true);
            mp.events.callRemote(VehicleRefueling._startRefuelEvent);
        }
    }
    static startRefuelInterval() {
        VehicleRefueling.refuelInterval = setInterval(() => {
            if (mp.keys.isDown(_control_ids.Y)) {
                VehicleRefueling.toggleFuelUi(true);
                mp.events.callRemote(VehicleRefueling._refuelServerEvent);
            }
            else {
                mp.events.callRemote(VehicleRefueling._stopRefuelEvent, "You have stopped refuelling.");
            }
        }, VehicleRefueling._refuelInterval_seconds * 1000);
    }
    static endRefuelling(callRemote = false) {
        if (VehicleRefueling.refuelInterval) {
            VehicleRefueling.toggleFuelUi(false);
            clearInterval(VehicleRefueling.refuelInterval);
            VehicleRefueling.refuelInterval = undefined;
            if (callRemote) {
                mp.events.callRemote(VehicleRefueling._stopRefuelEvent, "");
            }
        }
    }
    static async handleEntityStreamIn(entity) {
        if (entity.type != "player")
            return;
        let refuelData = entity.getVariable(VehicleRefueling._refuelDataIdentifier);
        if (refuelData) {
            VehicleRefueling.playRefuelAnimation(entity);
            VehicleRefueling.attachFuelObjectToEntity(entity);
        }
        else {
            entity.clearTasks();
            VehicleRefueling.removeFuelNozzleForEntity(entity);
        }
    }
    static async handleRefuellingDataHandler(entity, data) {
        if (entity.type != "player")
            return;
        if (data) {
            VehicleRefueling.playRefuelAnimation(entity);
            VehicleRefueling.attachFuelObjectToEntity(entity);
        }
        else {
            VehicleRefueling.removeFuelNozzleForEntity(entity);
            entity.clearTasks();
        }
    }
    static toggleFuelUi(toggle) {
        BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
            _stateKey: "refuelUi",
            status: ${toggle}
        })`);
    }
    static async playRefuelAnimation(entity) {
        for (let i = 0; entity.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        mp.game.streaming.requestAnimDict('timetable@gardener@filling_can');
        await mp.game.waitAsync(50);
        entity.taskPlayAnim('timetable@gardener@filling_can', 'gar_ig_5_filling_can', 8.0, 1.0, -1, 1, 1.0, false, false, false);
    }
    static async attachFuelObjectToEntity(entity) {
        VehicleRefueling.removeFuelNozzleForEntity(entity);
        entity._fuelNozzleObject = mp.objects.new('prop_cs_fuel_nozle', entity.position, {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: entity.dimension
        });
        if (!entity._fuelNozzleObject)
            return;
        for (let i = 0; entity._fuelNozzleObject.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }
        let boneIdx = entity.getBoneIndex(18905);
        entity._fuelNozzleObject.attachTo(entity.handle, boneIdx, 0.11, 0.02, 0.02, -80.0, -90.0, 15.0, true, true, false, false, 0, true);
    }
    static removeFuelNozzleForEntity(entity) {
        if (entity._fuelNozzleObject) {
            entity._fuelNozzleObject.destroy();
            entity._fuelNozzleObject = null;
        }
    }
}

class VehicleInsurance {
    static LocalPlayer;
    static _insuranceDataIdentifier = "vehicleInsuranceData";
    static _viewInsuranceVehiclesEvent = "server:viewInsuranceVehicles";
    constructor() {
        VehicleInsurance.LocalPlayer = mp.players.local;
        mp.events.add("render", VehicleInsurance.handleRender);
        mp.keys.bind(_control_ids.Y, true, VehicleInsurance.handleKeyPress_Y);
    }
    static handleRender() {
        if (VehicleInsurance.LocalPlayer.browserRouter == Browsers.Insurance) {
            DeathSystem.disableControls();
        }
    }
    static handleKeyPress_Y() {
        if (!validateKeyPress(true))
            return;
        let insuranceData = VehicleInsurance.LocalPlayer.getVariable(VehicleInsurance._insuranceDataIdentifier);
        if (insuranceData) {
            mp.events.callRemote(VehicleInsurance._viewInsuranceVehiclesEvent);
        }
    }
}

class MarkersAndLabels {
    static LocalPlayer;
    static defaultBlipTimeout_seconds = 30;
    constructor() {
        MarkersAndLabels.LocalPlayer = mp.players.local;
        mp.events.add("clientBlip:addClientBlip", MarkersAndLabels.addClientBlip);
    }
    static addClientBlip(blipSprite, name, position, blipColour, alpha = 255, timeout = MarkersAndLabels.defaultBlipTimeout_seconds) {
        let createdBlip = mp.blips.new(blipSprite, position, {
            alpha: alpha,
            color: blipColour,
            dimension: 0,
            drawDistance: 1.0,
            name: name,
            rotation: 0,
            scale: 1.0,
            shortRange: true
        });
        setTimeout(() => {
            if (createdBlip) {
                createdBlip.destroy();
                createdBlip = null;
            }
        }, timeout * 1000);
    }
}

class VehicleDamage {
    static LocalPlayer;
    static saveDamageEvent = "server:saveVehicleDamage";
    static _updateInterval;
    constructor() {
        VehicleDamage.LocalPlayer = mp.players.local;
        mp.events.add("playerEnterVehicle", (veh) => VehicleDamage.handleEnterOrLeave(veh, true));
        mp.events.add("playerLeaveVehicle", VehicleDamage.handleEnterOrLeave);
    }
    static async handleEnterOrLeave(vehicle, isEnterEvent = false) {
        if (!vehicle)
            return;
        let vehicleData = getVehicleData(vehicle);
        if (vehicleData && vehicleData.vehicle_health !== undefined && typeof vehicleData.vehicle_health === "number") {
            vehicle.setHealth(vehicleData.vehicle_health);
            vehicle.setBodyHealth(vehicleData.vehicle_health);
            vehicle.setEngineHealth(vehicleData.vehicle_health);
        }
        await mp.game.waitAsync(2500);
        isEnterEvent ? VehicleDamage.startInterval() : VehicleDamage.closeInterval();
    }
    static startInterval() {
        VehicleDamage._updateInterval = setInterval(async () => {
            if (VehicleDamage.LocalPlayer.vehicle) {
                let vehicleData = getVehicleData(VehicleDamage.LocalPlayer.vehicle);
                if (vehicleData && vehicleData.vehicle_health != Math.round(VehicleDamage.LocalPlayer.vehicle.getBodyHealth())) {
                    mp.events.callRemote(VehicleDamage.saveDamageEvent);
                    await mp.game.waitAsync(500);
                    let data = getVehicleData(VehicleDamage.LocalPlayer.vehicle);
                    if (VehicleDamage.LocalPlayer.vehicle && data && typeof data.vehicle_health == "number") {
                        VehicleDamage.LocalPlayer.vehicle.setEngineHealth(data.vehicle_health);
                    }
                }
            }
        }, 1000);
    }
    static closeInterval() {
        if (VehicleDamage._updateInterval) {
            clearInterval(VehicleDamage._updateInterval);
            VehicleDamage._updateInterval = undefined;
        }
    }
}

class VehicleRadar {
    static LocalPlayer;
    static drawBoneStart = 'chassis';
    static maxFindDist = 45;
    static emergencyVehicleClass = 18;
    constructor() {
        VehicleRadar.LocalPlayer = mp.players.local;
        mp.events.add('playerLeaveVehicle', (veh) => VehicleRadar.toggleRadarOn(veh, false));
        mp.events.add('playerEnterVehicle', (veh) => VehicleRadar.toggleRadarOn(veh, true));
        mp.events.add('render', VehicleRadar.handleRender);
    }
    static handleRender() {
        if (VehicleRadar.LocalPlayer.vehicle && VehicleRadar.LocalPlayer.vehicle.getClass() == VehicleRadar.emergencyVehicleClass) {
            if (VehicleRadar.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleRadar.LocalPlayer.handle ||
                VehicleRadar.LocalPlayer.vehicle.getPedInSeat(0) == VehicleRadar.LocalPlayer.handle) {
                const targetVehs = mp.vehicles.getClosest(VehicleRadar.LocalPlayer.vehicle.position, 2);
                if (targetVehs.length > 1) {
                    let distList = [];
                    targetVehs.forEach((veh) => {
                        if (veh.handle != VehicleRadar.LocalPlayer.vehicle.handle) {
                            let pPos = VehicleRadar.LocalPlayer.vehicle.position;
                            distList.push({
                                dist: mp.game.gameplay.getDistanceBetweenCoords(veh.position.x, veh.position.y, veh.position.z, pPos.x, pPos.y, pPos.z, true),
                                veh: veh
                            });
                        }
                    });
                    distList.sort((a, b) => a.dist - b.dist);
                    let targetV = distList[0].veh;
                    if (!targetV || distList[0].dist > VehicleRadar.maxFindDist || !mp.vehicles.at(targetV.remoteId)) {
                        VehicleRadar.toggleLastTracked(true);
                        return;
                    }
                    const boneIndex = VehicleRadar.LocalPlayer.vehicle.getBoneIndexByName(VehicleRadar.drawBoneStart);
                    const playerVehBonePos = VehicleRadar.LocalPlayer.vehicle.getWorldPositionOfBone(boneIndex);
                    const targetVehBonePos = targetV.getWorldPositionOfBone(boneIndex);
                    let intersectWithWorld = mp.raycasting.testPointToPoint(playerVehBonePos, targetVehBonePos, [VehicleRadar.LocalPlayer.vehicle.handle], 1 + 16);
                    if (!intersectWithWorld) {
                        let targetVehicleData = getVehicleData(targetV);
                        if (!targetVehicleData)
                            return;
                        VehicleRadar.toggleLastTracked(false);
                        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                            _stateKey: "vehicleRadarData",
                            status: ${JSON.stringify({
                            ownerName: targetVehicleData.owner_name,
                            speed: targetV.getSpeed(),
                            numberplate: targetVehicleData.numberplate,
                            vehicleName: targetVehicleData.vehicle_display_name
                        })}
                        })`);
                    }
                }
            }
        }
    }
    static toggleLastTracked(tog) {
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
            _stateKey: "vehRadarLastTracked",
            status: ${tog}
        })`);
    }
    static toggleRadarOn(veh, tog) {
        VehicleRadar.resetRadarData();
        if (veh && veh.getClass() == VehicleRadar.emergencyVehicleClass) {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleRadar",
                status: ${tog}
            })`);
        }
        else {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleRadar",
                status: false
            })`);
        }
    }
    static resetRadarData() {
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
            _stateKey: "vehicleRadarData",
            status: {}
        })`);
    }
}

class SpeedCameras {
    static LocalPlayer;
    static serverCameraTrigger = 'server:handleSpeedCamera';
    static flashDuration = 200;
    constructor() {
        SpeedCameras.LocalPlayer = mp.players.local;
        mp.events.add('client:speedCameraTrigger', SpeedCameras.handleTriggerEvent);
        mp.events.add('client:handleCameraFlash', SpeedCameras.handleCameraFlash);
    }
    static async handleCameraFlash(vehId, camPos_x, camPos_y, camPos_z) {
        if (vehId !== undefined) {
            let camPos = new mp.Vector3(camPos_x, camPos_y, camPos_z);
            if (!camPos)
                return;
            mp.game.audio.playSoundFromCoord(1, "Camera_Shoot", camPos.x, camPos.y, camPos.z, "Phone_Soundset_Franklin", false, 0, false);
            let takeFlashInterval = setInterval(() => {
                let targetVeh = mp.vehicles.at(vehId);
                if (targetVeh) {
                    let destinationCoords = targetVeh.position;
                    let dirVector = destinationCoords.subtract(camPos);
                    mp.game.graphics.drawSpotLight(camPos.x, camPos.y, camPos.z, dirVector.x, dirVector.y, dirVector.z, 255, 255, 255, 100, 5, 2, 100, 10);
                }
            }, 0);
            await mp.game.waitAsync(300);
            clearInterval(takeFlashInterval);
        }
    }
    static handleTriggerEvent() {
        if (SpeedCameras.LocalPlayer.vehicle && SpeedCameras.LocalPlayer.vehicle.getPedInSeat(-1) == SpeedCameras.LocalPlayer.handle) {
            mp.events.callRemote(SpeedCameras.serverCameraTrigger, SpeedCameras.LocalPlayer.vehicle.getSpeed());
        }
    }
}

class InventorySystem {
    static LocalPlayer;
    static _inventoryResyncEvent = "server:inventory:resyncItems";
    constructor() {
        InventorySystem.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.I, false, InventorySystem.toggleInventory);
    }
    static toggleInventory() {
        if (validateKeyPress(false, true, false) && getUserCharacterData()) {
            InventorySystem.LocalPlayer.inventoryStatus = !InventorySystem.LocalPlayer.inventoryStatus;
            mp.events.callRemote(InventorySystem._inventoryResyncEvent);
            BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
                _stateKey: "inventory",
                status: ${InventorySystem.LocalPlayer.inventoryStatus}
            })`);
        }
    }
}

class BanksAtms {
    static LocalPlayer;
    static _atmDataIdentifier = "atmColshapeData";
    static _tellerColshapeDataIdentifier = "bankTellerColshapeData";
    static serverAtmEvent = "server:openAtm";
    static serverBankEvent = "server:openBank";
    constructor() {
        BanksAtms.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.Y, false, BanksAtms.handleKeyPress_Y);
        mp.events.add("render", BanksAtms.handleRender);
        mp.events.add("playerExitColshape", BanksAtms.handleColShapeLeave);
    }
    static handleColShapeLeave(colShape) {
        if ((colShape.getVariable(BanksAtms._atmDataIdentifier) || colShape.getVariable(BanksAtms._tellerColshapeDataIdentifier)) && BanksAtms.LocalPlayer.browserRouter == Browsers.Atm) {
            BrowserSystem.handleReset();
        }
    }
    static handleRender() {
        if (BanksAtms.LocalPlayer.browserRouter == Browsers.Atm) {
            mp.gui.cursor.show(true, true);
        }
    }
    static handleKeyPress_Y() {
        if (validateKeyPress(true, true, true)) {
            let atmData = BanksAtms.LocalPlayer.getVariable(BanksAtms._atmDataIdentifier);
            let bankData = BanksAtms.LocalPlayer.getVariable(BanksAtms._tellerColshapeDataIdentifier);
            if (bankData) {
                mp.events.callRemote(BanksAtms.serverBankEvent);
                return;
            }
            if (atmData) {
                mp.events.callRemote(BanksAtms.serverAtmEvent);
            }
        }
    }
}

class ConvienceStores {
    static LocalPlayer;
    static _convienceStoreDataIdentifier = "storePedAndColshapeData";
    constructor() {
        ConvienceStores.LocalPlayer = mp.players.local;
        mp.events.add("entityStreamIn", ConvienceStores.handleStreamIn);
    }
    static handleStreamIn(entity) {
        if (entity.type == "ped" && entity.getVariable(ConvienceStores._convienceStoreDataIdentifier)) {
            ConvienceStores.initPed(entity);
        }
    }
    static initPed(ped) {
        ped.setDynamic(false);
        ped.freezePosition(true);
        ped.setInvincible(true);
        ped.setProofs(false, false, false, false, false, false, false, false);
    }
}

class CruiseControl {
    static localPlayer;
    constructor() {
        CruiseControl.localPlayer = mp.players.local;
        mp.events.add("playerEnterVehicle", CruiseControl.handleVehicleEnter);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, CruiseControl.handleDataHandler);
    }
    static handleDataHandler(entity, data) {
        if (entity.type != "vehicle" || !data)
            return;
        if (CruiseControl.localPlayer.vehicle && typeof data.speed_limit === "number" && CruiseControl.localPlayer.vehicle.handle === entity.handle && CruiseControl.localPlayer.vehicle.getPedInSeat(-1) === CruiseControl.localPlayer.handle) {
            entity.setMaxSpeed(data.speed_limit);
        }
    }
    static handleVehicleEnter(vehicle, seat) {
        let vehicleData = getVehicleData(vehicle);
        if (vehicleData && typeof vehicleData.speed_limit === "number" && vehicleData.speed_limit !== -1 && seat === -1) {
            vehicle.setMaxSpeed(vehicleData.speed_limit);
        }
    }
}

class PlayerDealership {
    static LocalPlayer = mp.players.local;
    static _playerVehicleDealerDataIdentifier = "playerVehicleDealershipData";
    constructor() {
        mp.events.add({
            "entityStreamIn": PlayerDealership.handleEntityStreamIn,
            "render": PlayerDealership.handleRender
        });
        mp.events.addDataHandler(PlayerDealership._playerVehicleDealerDataIdentifier, PlayerDealership.handleDataHandler);
        setInterval(() => {
            mp.vehicles.forEachInStreamRange(veh => {
                if (veh.isPositionFrozen && !veh.isOnAllWheels()) {
                    veh.freezePosition(false);
                    while (!veh.isOnAllWheels()) {
                        mp.game.wait(0);
                    }
                    veh.freezePosition(true);
                }
            });
        }, 6900);
    }
    static handleRender() {
        mp.vehicles.forEachInStreamRange(veh => {
            let vehicleData = getVehicleData(veh);
            if (vehicleData && vehicleData.dealership_id != -1) {
                let drawCoordsChassis = mp.game.graphics.world3dToScreen2d(new mp.Vector3(veh.position.x, veh.position.y, veh.position.z));
                let playerPos = PlayerDealership.LocalPlayer.position;
                const distance = new mp.Vector3(playerPos.x, playerPos.y, playerPos.z)
                    .subtract(new mp.Vector3(veh.position.x, veh.position.y, veh.position.z))
                    .length();
                if (drawCoordsChassis && distance < 10) {
                    mp.game.graphics.drawText(`~y~${vehicleData.vehicle_display_name}`, [drawCoordsChassis.x, drawCoordsChassis.y - 0.02], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.3, 0.3],
                        outline: false
                    });
                    mp.game.graphics.drawText(`Being sold for ~g~$${vehicleData.dealership_price.toLocaleString('en-US')}`, [drawCoordsChassis.x, drawCoordsChassis.y], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.3, 0.3],
                        outline: false
                    });
                    mp.game.graphics.drawText(`"${vehicleData.dealership_description}"`, [drawCoordsChassis.x, drawCoordsChassis.y + 0.02], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.2, 0.2],
                        outline: false
                    });
                }
            }
        });
    }
    static async handleDataHandler(vehicle, value) {
        if (vehicle.type === "vehicle" && value !== undefined) {
            if (!value) {
                vehicle.freezePosition(false);
                return;
            }
            await mp.game.waitAsync(2500);
            if (mp.vehicles.at(vehicle.remoteId)) {
                PlayerDealership.reseatVehiclePosition(vehicle);
            }
        }
    }
    static async handleEntityStreamIn(vehicle) {
        if (vehicle.type === "vehicle") {
            await mp.game.waitAsync(2500);
            if (vehicle && mp.vehicles.at(vehicle.remoteId)) {
                let vehicleData = getVehicleData(vehicle);
                if (vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
                    PlayerDealership.reseatVehiclePosition(vehicle);
                }
            }
        }
    }
    static reseatVehiclePosition(vehicle) {
        while (!vehicle.isOnAllWheels()) {
            mp.game.wait(0);
        }
        vehicle.freezePosition(true);
    }
}

class Crouching {
    static LocalPlayer;
    static remoteEvent = "server:anim:toggleCrouching";
    static movementClipSet = "move_ped_crouched";
    static strafeClipSet = "move_ped_crouched_strafing";
    static _crouchingAnimIdentifier = "anim:isCrouching";
    static clipSetSwitchTime = 0.25;
    constructor() {
        Crouching.loadClipSet(Crouching.movementClipSet);
        Crouching.loadClipSet(Crouching.strafeClipSet);
        mp.events.add("entityStreamIn", Crouching.handleStreamIn);
        mp.events.addDataHandler(Crouching._crouchingAnimIdentifier, Crouching.handleDataHandler);
        mp.keys.bind(223, false, Crouching.handleKeyPress);
    }
    static handleStreamIn(entity) {
        if (entity.type === "player" && entity.getVariable(Crouching._crouchingAnimIdentifier)) {
            entity.setMovementClipset(Crouching.movementClipSet, Crouching.clipSetSwitchTime);
            entity.setStrafeClipset(Crouching.strafeClipSet);
        }
    }
    static handleKeyPress() {
        if (validateKeyPress(true, true, true)) {
            mp.events.callRemote(Crouching.remoteEvent);
        }
    }
    static handleDataHandler(entity, value) {
        if (entity.type === "player") {
            if (value) {
                entity.setMovementClipset(Crouching.movementClipSet, Crouching.clipSetSwitchTime);
                entity.setStrafeClipset(Crouching.strafeClipSet);
            }
            else {
                entity.resetMovementClipset(Crouching.clipSetSwitchTime);
                entity.resetStrafeClipset();
            }
        }
    }
    static loadClipSet(clipSetName) {
        mp.game.streaming.requestClipSet(clipSetName);
        while (!mp.game.streaming.hasClipSetLoaded(clipSetName))
            mp.game.wait(0);
    }
    ;
}

class Weather {
    static LocalPlayer = mp.players.local;
    constructor() {
        mp.events.add("client:weatherSet", Weather.handleWeatherChange);
    }
    static handleWeatherChange(weatherType) {
        mp.game.gameplay.setWeatherTypeOverTime(weatherType, 0);
    }
}

// initialize client classes.
new PlayerAuthentication();
new BrowserSystem();
new AdminSystem();
new NameTags();
new AdminFly();
new AdminEvents();
new SwitchCamera();
new GuiSystem();
new EnterVehicle();
new VehicleLocking();
new NotificationSystem();
new VehicleSystems();
new VehicleInteraction();
new VehicleWindows();
new VehicleEngine();
new VehicleIndicators();
new VehicleSiren();
new CharacterSystem();
new AntiCheat();
new AdminEsp();
new VoiceSystem();
new DeathSystem();
new VehicleSpeedo();
new VehicleFuel();
new WeaponSystem();
new Corpses();
new Afk();
new Clothing();
new VehicleCustoms();
new ParkingSystem();
new VehicleDealerShips();
new Tattoos();
new HousingSystem();
new VehicleRefueling();
new VehicleInsurance();
new MarkersAndLabels();
new PhoneSystem();
new VehicleDamage();
new VehicleRadar();
new HandsUp();
new ScaleForm();
new SpeedCameras();
new BanksAtms();
new InventorySystem();
new ConvienceStores();
new CruiseControl();
new PlayerDealership();
new Crouching();
new Weather();
