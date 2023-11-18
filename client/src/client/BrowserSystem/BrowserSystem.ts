import { BrowserEnv } from "../enums";


class BrowserSystem {
	public _browserBaseUrl: string = BrowserEnv.development;
	public _browserInstance: BrowserMp;

	constructor() {
		this._browserInstance = mp.browsers.new(this._browserBaseUrl);
		this.init();

		this.say(`Browser url ${this._browserInstance.url}`);

		mp.events.add("browser:pushRouter", (browserName: string) => {
			this._browserInstance.execute(`router.push('${browserName}')`); // Vue Browser strings can be annoy
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
