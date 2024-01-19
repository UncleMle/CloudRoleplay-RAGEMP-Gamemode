import { BrowserEnv } from '../enums';
import { F2 } from './ClientButtons';
import { _REMOVE_TIMER_NATIVE } from '../Constants/Constants';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import { CharacterData } from '@/@types';

let isFunctionPressed: boolean;

export default class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public static _browserInstance: BrowserMp;
	public static IdleDate: Date = new Date();
	public static LocalPlayer: PlayerMp;

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
			} else {
				mp.gui.cursor.show(false, false);
			}
		});
	}

	public static clearChat() {
		BrowserSystem._browserInstance?.execute("gui.chat.clearChat();");
	}

	public static onGuiReady() {
		mp.gui.chat.show(false);
		BrowserSystem._browserInstance?.markAsChat();
	}

	public static setAuthState(state: string) {
		if (BrowserSystem._browserInstance) {
			BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
				_stateKey: "authenticationState",
				status: "${state}"
			})`);
		}
	}

	public static handleRender() {
		BrowserSystem.disableAfkTimer();
		BrowserSystem.disableDefaultGuiElements();

		let characterData: CharacterData | undefined = getUserCharacterData();

		if (characterData?.routeIsFrozen && BrowserSystem.LocalPlayer.browserRouter != "/") {
			mp.gui.cursor.show(true, true);
		}
	}

	public static pushRouter(route: string, showCursor: boolean = true) {
		if (BrowserSystem._browserInstance) {
			if (showCursor) {
				mp.gui.cursor.show(true, true);
			}
			BrowserSystem.LocalPlayer.browserRouter = route;
			BrowserSystem._browserInstance.execute(`router.push("${route}")`);
		}
	}

	public static handleMutationChange(mutationName: string, key: string, value: any) {
		if (BrowserSystem._browserInstance) {
			BrowserSystem._browserInstance.execute(`appSys.commit("${mutationName}", {
						${key}: ${value}
			})`);
		}
	}

	public static handleReset() {
		BrowserSystem.pushRouter('/');
		mp.gui.cursor.show(false, false);
	}

	public static handleObjectToBrowser(_mutationKey: string, data: any) {
		if (!BrowserSystem._browserInstance) return;
		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
			_mutationKey: "${_mutationKey}",
			data: ${JSON.stringify(data)}
		})`);
	}

	public static handleObjectToBrowserPush(_mutationKey: string, data: object) {
		if (!BrowserSystem._browserInstance) return;
		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationPusher", {
			_mutationKey: "${_mutationKey}",
			data: ${JSON.stringify(data)}
		})`);
	}

	public static resetMutationPusher = (_mutationKey: string) => {
		if (!BrowserSystem._browserInstance) return;
		BrowserSystem._browserInstance.execute(`appSys.commit('setLoadingState', {
			toggle: false
		})`);
		BrowserSystem._browserInstance.execute(`appSys.commit("resetPlayerMutationPusher", {
			_mutationKey: "${_mutationKey}",
		})`);
	};

	public static sendErrorPushNotif(message: string, time: number) {
		BrowserSystem._browserInstance.execute(`gui.notify.sendError("${message}", ${time});`);
	}

	public static sendNotif(message: string, progbar: boolean, dragbl: boolean, time: number) {
		BrowserSystem._browserInstance.execute(`gui.notify.showNotification("${message}", ${progbar}, ${dragbl}, ${time});`);
	}

	public static handleBrowserObject(eventName: string, _object: object) {
		mp.events.callRemote(eventName, _object);
	}

	public static handleBrowserString(eventName: string, _string: any) {
		mp.events.callRemote(eventName, _string);
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
