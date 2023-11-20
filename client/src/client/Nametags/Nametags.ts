import { UserData } from "../@types";
import getUserData from "../PlayerMethods/getUserData";

class NameTags {
	public static userData: UserData | undefined;
	public static maxDistance: number = 25 * 25;
	public static width: number = 0.03;
	public static height: number = 0.0065;
	public static border: number = 0.001;
	public static color: Array4d = [255, 255, 255, 255];

	constructor() {
		mp.events.add('render', (nametags) => {
			const graphics: GameGraphicsMp = mp.game.graphics;
			const screenRes: GetScreenResolutionResult = graphics.getScreenResolution();
			NameTags.userData = getUserData();

			if (!NameTags.userData) return;

			nametags.forEach(nametag => {
				let [player, x, y, distance] = nametag;

				if (distance <= NameTags.maxDistance) {
					let scale: number = (distance / NameTags.maxDistance);
					if (scale < 0.6) scale = 0.6;

					var health: number = player.getHealth();
					health = health < 100 ? 0 : ((health - 100) / 100);

					var armour: number = player.getArmour() / 100;

					y -= scale * (0.005 * (screenRes.y / 1080));

					graphics.drawText(NameTags.userData?.username as string, [x, y],
						{
							font: 4,
							color: NameTags.color,
							scale: [0.4, 0.4],
							outline: true
						});

					if (NameTags.userData?.adminDuty) {
						let y2 = y + 0.042;

						if (armour > 0) {
							let x2 = x - NameTags.width / 2 - NameTags.border / 2;

							graphics.drawRect(x2, y2, NameTags.width + NameTags.border * 2, 0.0085, 0, 0, 0, 200, false);
							graphics.drawRect(x2, y2, NameTags.width, NameTags.height, 150, 150, 150, 255, false);
							graphics.drawRect(x2 - NameTags.width / 2 * (1 - health), y2, NameTags.width * health, NameTags.height, 255, 255, 255, 200, false);

							x2 = x + NameTags.width / 2 + NameTags.border / 2;

							graphics.drawRect(x2, y2, NameTags.width + NameTags.border * 2, NameTags.height + NameTags.border * 2, 0, 0, 0, 200, false);
							graphics.drawRect(x2, y2, NameTags.width, NameTags.height, 41, 66, 78, 255, false);
							graphics.drawRect(x2 - NameTags.width / 2 * (1 - armour), y2, NameTags.width * armour, NameTags.height, 48, 108, 135, 200, false);
						}
						else {
							graphics.drawRect(x, y2, NameTags.width + NameTags.border * 2, NameTags.height + NameTags.border * 2, 0, 0, 0, 200, false);
							graphics.drawRect(x, y2, NameTags.width, NameTags.height, 150, 150, 150, 255, false);
							graphics.drawRect(x - NameTags.width / 2 * (1 - health), y2, NameTags.width * health, NameTags.height, 255, 255, 255, 200, false);
						}
					}
				}
			})
		})
	}
}

export default NameTags;
