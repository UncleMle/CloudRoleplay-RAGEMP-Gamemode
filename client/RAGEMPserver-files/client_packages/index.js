'use strict';

const CLEAR_FOCUS = "0x31B73D1EA9F01DA2";
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
        this.range = 220;
        this.speed = 1.4;
        this.create();
        Camera.Current_Cam = this;
        mp.events.add("render", () => {
            if (Camera.Current_Cam === null || !Camera.Current_Cam.isMoving)
                return;
            let position = Camera.Current_Cam.camera.getCoord();
            Camera.Current_Cam.camera.setCoord(position.x + Camera.Current_Cam.speed, position.y, position.z);
            if (position.x + Camera.Current_Cam.speed >= Camera.Current_Cam.position.x + (Camera.Current_Cam.range / 2)
                || position.x + Camera.Current_Cam.speed <= Camera.Current_Cam.position.x - (Camera.Current_Cam.range / 2)) {
                Camera.Current_Cam.speed *= -1;
            }
        });
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
        this.camera?.destroy();
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
        mp.game.invoke(CLEAR_FOCUS);
        Camera.Current_Cam = null;
    }
}

//const START_SPAWN_VECTOR: Vector3 = new mp.Vector3(-811.6, 174.9, 76.8);
class PlayerAuthentication {
    LoginCamera;
    constructor() {
        this.LoginCamera = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));
        mp.events.add({
            "playerReady": () => {
                mp.events.call("client:loginStart");
            },
            "client:loginStart": () => {
                mp.events.call("browser:pushRouter", "login");
                this.LoginCamera.startMoving(7100.0);
                this.LoginCamera.setActive();
                this.freezeAndBlurClient();
            },
            "client:loginEnd": () => {
                this.endClientLogin();
            }
        });
    }
    freezeAndBlurClient() {
        mp.game.ui.displayRadar(false);
        mp.gui.cursor.show(true, true);
        mp.players.local.position = new mp.Vector3(-811.6, 174.9, 76.8);
        mp.players.local.freezePosition(true);
        mp.players.local.setAlpha(0);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.graphics.transitionToBlurred(100);
        mp.players.local.freezePosition(true);
    }
    endClientLogin() {
        mp.events.call("browser:pushRouter", "/");
        mp.game.ui.displayRadar(true);
        mp.players.local.setAlpha(255);
        mp.game.graphics.transitionFromBlurred(100);
        mp.players.local.freezePosition(false);
        this.LoginCamera.delete();
        mp.events.call("chat:activate");
    }
}

var BrowserEnv;
(function (BrowserEnv) {
    BrowserEnv["development"] = "http://localhost:8080/";
    BrowserEnv["production"] = "http://localhost:8080/";
})(BrowserEnv || (BrowserEnv = {}));

const F2 = 0x71;

const _REMOVE_TIMER_NATIVE = "0xF4F2C0D4EE209E20";
let isFunctionPressed;
let isClientTyping;
class BrowserSystem {
    _browserBaseUrl = BrowserEnv.development;
    _browserInstance;
    clientAuthenticated;
    IdleDate = new Date();
    constructor() {
        this._browserInstance = mp.browsers.new(this._browserBaseUrl);
        this.clientAuthenticated = mp.players.local.getVariable("client:authStatus");
        this.init();
        mp.events.add({
            "guiReady": () => {
                mp.gui.chat.show(false);
                this._browserInstance?.markAsChat();
                mp.console.logInfo("GUI Ready and chat initiated");
            },
            "browser:pushRouter": (browserName) => {
                this._browserInstance.execute(`router.push('${browserName}')`);
            },
            "render": () => {
                mp.players.local.isTypingInTextChat ? isClientTyping = true : isClientTyping = false;
                this.disableAfkTimer();
            },
            'browser:sendObject': (eventName, _object) => {
                mp.events.callRemote(eventName, _object);
            }
        });
        mp.keys.bind(F2, false, function () {
            isFunctionPressed = !isFunctionPressed;
            if (isClientTyping)
                return;
            if (isFunctionPressed && !mp.game.ui.isPauseMenuActive()) {
                mp.gui.cursor.show(true, true);
            }
            else {
                mp.gui.cursor.show(false, false);
            }
        });
    }
    init() {
        //mp.gui.chat.push("Browser has been started under address " + this._browserBaseUrl);
    }
    disableAfkTimer() {
        const dif = new Date().getTime() - this.IdleDate.getTime();
        const seconds = dif / 1000;
        if (Math.abs(seconds) > 29.5) {
            mp.game.invoke(_REMOVE_TIMER_NATIVE);
            this.IdleDate = new Date();
        }
    }
}

// initialize client classes.
new PlayerAuthentication();
new BrowserSystem();
