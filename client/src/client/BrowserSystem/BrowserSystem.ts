import { BrowserEnv } from "../enums";


class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;

	constructor() {
		this._browserInstance = mp.browsers.new(this._browserBaseUrl);
		this.init();

		mp.events.add("browser:pushRouter", (browserName: string) => {
			this._browserInstance.execute(`router.push(${browserName})`);
			this.say("[DEBUG] " + "App router pushed to " + browserName);
		})
	}

	init() {
		this.say("Browser has been started under address " + this._browserBaseUrl);
	}


	say(str: string) {
		mp.gui.chat.push(str);
	}
}

export default BrowserSystem;
