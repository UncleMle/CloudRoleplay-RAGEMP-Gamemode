import { BrowserEnv, Browsers } from '../enums';
import { F2 } from './ClientButtons';
import { _REMOVE_TIMER_NATIVE } from '../Constants/Constants';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import { CharacterData } from '@/@types';

export default class BrowserSystem {
	public static _browserInstance: BrowserMp = mp.browsers.new(BrowserEnv.development);
	public static IdleDate: Date = new Date();
	public static LocalPlayer: PlayerMp = mp.players.local;
	public static f2Cursor: boolean = false;

	constructor() {
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
		mp.events.add('browser:playerFrontendSound', BrowserSystem.playFrontendSound);

		mp.keys.bind(F2, false, BrowserSystem.handleF2Press);

		setInterval(() => {
			BrowserSystem.disableAfkTimer();
		}, 12000);
	}

	private static handleF2Press() {
		BrowserSystem.f2Cursor = !BrowserSystem.f2Cursor;
		if (BrowserSystem.f2Cursor && !mp.game.ui.isPauseMenuActive()) {
			mp.gui.cursor.show(true, true);
		} else {
			mp.gui.cursor.show(false, false);
		}
	}

	private static playFrontendSound(soundName: string, soundSetName: string) {
		mp.game.audio.playSoundFrontend(-1, soundName, soundSetName, true);
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
		BrowserSystem.disableDefaultGuiElements();

		let characterData: CharacterData | undefined = getUserCharacterData();

		if (characterData?.routeIsFrozen && BrowserSystem.LocalPlayer.browserRouter != "/" || BrowserSystem.LocalPlayer.browserRouter === Browsers.PromptMenu) {
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

		if (typeof data === "string") data = JSON.parse(data);

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

	public static resetMutationPusher(_mutationKey: string) {
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
