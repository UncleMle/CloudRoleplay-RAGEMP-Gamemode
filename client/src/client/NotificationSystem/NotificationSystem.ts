class NotificationSystem {
	public static x_pos: number = 0.5;
	public static y_pos: number = 0.5;
	public static ameDuration_seconds: number = 6;
	public static opacity: number = 255;
	public static scale: number = 0.55;
	public static draw_text: string;
	public static visible: boolean;
	public static interval: ReturnType<typeof setInterval> | undefined;
	public static ameCancelTimeout: ReturnType<typeof setInterval> | undefined;
	public static _ameServerEvent: string = "server:createAmeText";
	public static _ameTextIdentifier: string = "playerAmeTextMessage";


	constructor() {
		mp.events.add("render", NotificationSystem.handleRender);
		mp.events.add("client:addNotif", NotificationSystem.createNotification);
	}

	public static createNotification(text: string, isRpText: boolean = true, isAme: boolean = false, ameText: string = "") {
		clearInterval(NotificationSystem.interval);

		NotificationSystem.resetData();
		NotificationSystem.visible = true;
		NotificationSystem.draw_text = isRpText ? "* " + text : text;

		NotificationSystem.interval = setInterval(() => {

			if (NotificationSystem.opacity < 1) {
				clearInterval(NotificationSystem.interval);
				NotificationSystem.resetData();
				return;
			}

			NotificationSystem.opacity -= 0.7;
			NotificationSystem.y_pos += 0.0005;
		}, 10);

		if(isAme) {
			mp.events.callRemote(NotificationSystem._ameServerEvent, ameText);

			if(NotificationSystem.ameCancelTimeout) {
				clearTimeout(NotificationSystem.ameCancelTimeout);
				NotificationSystem.ameCancelTimeout = undefined;
			}

			NotificationSystem.ameCancelTimeout = setTimeout(() => {
				mp.events.callRemote(NotificationSystem._ameServerEvent, null);
				NotificationSystem.ameCancelTimeout = undefined;
			}, NotificationSystem.ameDuration_seconds * 1000);
		}
	}

	public static resetData() {
		NotificationSystem.interval = undefined;
		NotificationSystem.x_pos = 0.5;
		NotificationSystem.y_pos = 0.5;
		NotificationSystem.opacity = 255;
		NotificationSystem.scale = 0.55;
		NotificationSystem.visible = false;
	}

	public static handleRender() {
		if (NotificationSystem.visible && NotificationSystem.draw_text) {
			mp.game.graphics.drawText(NotificationSystem.draw_text, [NotificationSystem.x_pos, NotificationSystem.y_pos], {
				outline: true,
				font: 4,
				color: [220, 125, 225, NotificationSystem.opacity],
				scale: [NotificationSystem.scale, NotificationSystem.scale]
			})
		}
	}
}

export default NotificationSystem;
