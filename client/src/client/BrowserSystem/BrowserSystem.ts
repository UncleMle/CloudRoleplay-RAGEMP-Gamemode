import toggleChat from "../PlayerMethods/ToggleChat";
import { BrowserEnv } from "../enums";
import { F2 } from './ClientButtons';
import { _REMOVE_TIMER_NATIVE } from '../Constants/Constants';
import getUserCharacterData from "../PlayerMethods/getUserCharacterData";


let isFunctionPressed: boolean;

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public static _browserInstance: BrowserMp;
	public clientAuthenticated: boolean;
	public static IdleDate: Date = new Date();

	constructor() { 
		BrowserSystem._browserInstance = mp.browsers.new(this._browserBaseUrl);
		mp.players.local.browserInstance = BrowserSystem._browserInstance;
		this.clientAuthenticated = mp.players.local.getVariable("client:authStatus");

		mp.events.add("guiReady", BrowserSystem.onGuiReady);
		mp.events.add("browser:pushRouter", BrowserSystem.handleBrowserPush);
		mp.events.add("render", BrowserSystem.handleRender);
		mp.events.add("client:recieveUiMutation", BrowserSystem.handleMutationChange);
		mp.events.add("browser:sendObject", BrowserSystem.handleBrowserObject);

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

	public static onGuiReady() {
		mp.gui.chat.show(false);
		BrowserSystem._browserInstance?.markAsChat();
		mp.console.logInfo("GUI Ready and chat initiated");
	}

	public static handleBrowserPush(browserName: string) {
		BrowserSystem._browserInstance.execute(`router.push('${browserName}')`);
	}

	public static handleRender() {
		BrowserSystem.disableAfkTimer();
		BrowserSystem.disableDefaultGuiElements();

		if (BrowserSystem._browserInstance && !getUserCharacterData()) {
			toggleChat(false);
		}
	}

	public static handleMutationChange(mutationName: string, key: string, value: any) {
		if (BrowserSystem._browserInstance) {
			BrowserSystem._browserInstance.execute(`store.commit('${mutationName}', {
						${key}: ${value}
					})`);
		}
	}

	public static handleBrowserObject(eventName: string, _object: object) {
		mp.events.callRemote(eventName, _object);
	}

	public static disableAfkTimer() {
		const dif: number = new Date().getTime() - BrowserSystem.IdleDate.getTime();
		const seconds: number = dif / 1000;
		if (Math.abs(seconds) > 29.5) {
			mp.game.invoke(_REMOVE_TIMER_NATIVE); 
			BrowserSystem.IdleDate = new Date();
		}
	}

	public static disableDefaultGuiElements() {
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

export default BrowserSystem;
