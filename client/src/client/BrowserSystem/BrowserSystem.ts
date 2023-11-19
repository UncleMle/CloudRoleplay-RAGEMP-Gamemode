import { BrowserEnv } from "../enums";
import { F2 } from './ClientButtons';

const _REMOVE_TIMER_NATIVE: string = "0xF4F2C0D4EE209E20";
let isFunctionPressed: boolean;
let isClientTyping: boolean;

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;
	public clientAuthenticated: boolean;
	public IdleDate: Date = new Date();

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
			"browser:pushRouter": (browserName: string) => {
				this._browserInstance.execute(`router.push('${browserName}')`);
			},
			"render": () => {
				mp.players.local.isTypingInTextChat ? isClientTyping = true : isClientTyping = false;
				this.disableAfkTimer();
			},
			'browser:sendObject': (eventName: string, _object: object) => {
				mp.events.callRemote(eventName, _object);
			}
		});

		mp.keys.bind(F2, false, function () {
			isFunctionPressed = !isFunctionPressed;
			if (isClientTyping) return
			if (isFunctionPressed && !mp.game.ui.isPauseMenuActive()) {
				mp.gui.cursor.show(true, true);
			}
			else {
				mp.gui.cursor.show(false, false);
			}
		})
	}

	init() {
		//mp.gui.chat.push("Browser has been started under address " + this._browserBaseUrl);
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
