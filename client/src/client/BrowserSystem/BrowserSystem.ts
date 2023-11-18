import { BrowserEnv } from "../enums";

class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;

	constructor() {
		this._browserInstance = mp.browsers.new(this._browserBaseUrl);
		this.init();
	}

	init() {
		this.say("Browser has been started under address " + this._browserBaseUrl);
	}


	say(str: string) {
		mp.gui.chat.push(str);
	}
}

export default BrowserSystem;
