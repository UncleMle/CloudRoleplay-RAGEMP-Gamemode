declare global {
	interface PlayerMp {
		customProperty: number;
		browserInstance: BrowserMp;
		customMethod(): void;
	}
}

export {};
