import toggleChat from "../PlayerMethods/ToggleChat";
import { BrowserEnv } from "../enums";
import { F2 } from './ClientButtons';
import { _REMOVE_TIMER_NATIVE, _sharedCharacterDataIdentifier } from '../Constants/Constants';

let isFunctionPressed: boolean;

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;
	public clientAuthenticated: boolean;
	public static IdleDate: Date = new Date();

	constructor() { 
		this._browserInstance = mp.browsers.new(this._browserBaseUrl);
		mp.players.local.browserInstance = this._browserInstance;
		this.clientAuthenticated = mp.players.local.getVariable("client:authStatus");

		mp.events.add({
			"guiReady": () => {
				mp.gui.chat.show(false);
				this._browserInstance?.markAsChat();
				mp.console.logInfo("GUI Ready and chat initiated");
			},
			"browser:pushRouter": (browserName: string) => {
				this._browserInstance.execute(`router.push('${browserName}')`);
			},
			"render": () => {
				BrowserSystem.disableAfkTimer();
				BrowserSystem.disableDefaultGuiElements();

				if (this._browserInstance && !mp.players.local.getVariable(_sharedCharacterDataIdentifier)) {
					toggleChat(false);
				}
			},
			'client:recieveUiMutation': (mutationName: string, key: string, value: any) => {
				if (this._browserInstance) {
					this._browserInstance.execute(`store.commit('${mutationName}', {
						${key}: ${value}
					})`);
				}
			},
			'browser:sendObject': (eventName: string, _object: object) => {
				mp.events.callRemote(eventName, _object);
			}
		});

		mp.keys.bind(F2, false, function () {
			isFunctionPressed = !isFunctionPressed;
			if (isFunctionPressed && !mp.game.ui.isPauseMenuActive()) {
				mp.gui.cursor.show(true, true);
			}
			else {
				mp.gui.cursor.show(false, false);
			}
		})
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
