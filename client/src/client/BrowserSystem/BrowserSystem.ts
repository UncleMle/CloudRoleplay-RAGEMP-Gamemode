import { BrowserEnv } from "../enums";
import { F2 } from './ClientButtons';


let isFunctionPressed: boolean;
let isClientTyping: boolean;

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;
	public clientAuthenticated: boolean;

	constructor() { 
		this._browserInstance = mp.browsers.new(this._browserBaseUrl);
		this.clientAuthenticated = mp.players.local.getVariable("client:authStatus");
		this.init();

		mp.events.add({
			"browser:pushRouter": (browserName: string) => {
				this._browserInstance.execute(`router.push('${browserName}')`);
			},
			"render": () => {
				mp.players.local.isTypingInTextChat ? isClientTyping = true : isClientTyping = false;
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
		mp.gui.chat.push("Browser has been started under address " + this._browserBaseUrl);
	}
}

export default BrowserSystem;
