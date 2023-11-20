import toggleChat from "../PlayerMethods/ToggleChat";
import { BrowserEnv } from "../enums";
import { F2 } from './ClientButtons';
import { _REMOVE_TIMER_NATIVE, _sharedCharacterDataIdentifier } from '../Constants/Constants';

let isFunctionPressed: boolean;
let isClientTyping: boolean;

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;
	public clientAuthenticated: boolean;
	public IdleDate: Date = new Date();

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
				mp.players.local.isTypingInTextChat ? isClientTyping = true : isClientTyping = false;

				if (this._browserInstance && !mp.players.local.getVariable(_sharedCharacterDataIdentifier)) {
					toggleChat(false);
				}

				mp.console.logInfo("Shared acc data: " + JSON.stringify(mp.players.local.getVariable(_sharedCharacterDataIdentifier)));


				this.disableAfkTimer();
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
			//if (isClientTyping) return
			if (isFunctionPressed && !mp.game.ui.isPauseMenuActive()) {
				mp.gui.cursor.show(true, true);
			}
			else {
				mp.gui.cursor.show(false, false);
			}
		})
	}

	disableAfkTimer() {
		const dif: number = new Date().getTime() - this.IdleDate.getTime();
		const seconds: number = dif / 1000;
		if (Math.abs(seconds) > 29.5) {
			mp.game.invoke(_REMOVE_TIMER_NATIVE); 
			this.IdleDate = new Date();
		}
	}
}

export default BrowserSystem;
