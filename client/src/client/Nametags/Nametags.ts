import { UserData } from "../@types";
import { _TEXT_R_RED, _TEXT_R_WHITE } from '../Constants/Constants';
import getTargetData from "../PlayerMethods/getTargetData";

class NameTags {
	public static userData: UserData | undefined;
	public static LocalPlayer: PlayerMp;
	public static ScreenRes: GetScreenResolutionResult;

	constructor() {
		NameTags.LocalPlayer = mp.players.local;
		NameTags.ScreenRes = mp.game.graphics.getScreenResolution();

		mp.nametags.enabled = false;
		mp.events.add('render', () => {
			mp.players.forEachInRange(NameTags.LocalPlayer.position, 20, (Target) => {
				const targetUserData: UserData | undefined = getTargetData(Target);
				const TargetPosition = Target.position;
				const PlayerPosition = NameTags.LocalPlayer.position;

				if (!targetUserData) return;

				const Distance = new mp.Vector3(PlayerPosition.x, PlayerPosition.y, PlayerPosition.z)
					.subtract(new mp.Vector3(TargetPosition.x, TargetPosition.y, TargetPosition.z))
					.length();
					
				if (Distance < 8 && NameTags.LocalPlayer.id != Target.id && NameTags.LocalPlayer.hasClearLosTo(Target.handle, 17)) {
					const Index = Target.getBoneIndex(12844);
					const NameTag = Target.getWorldPositionOfBone(Index);
					const Position = mp.game.graphics.world3dToScreen2d(new mp.Vector3(NameTag.x, NameTag.y, NameTag.z + 0.4));

					if (!Position) return;

					let x = Position.x;
					let y = Position.y;

					let scale = Distance / 25;
					if (scale < 0.6) scale = 0.6;

					y -= scale * (0.005 * (NameTags.ScreenRes.y / 1080)) - parseInt('0.010');

					let DefaultTagContent = `[${targetUserData.playerId}] ${targetUserData.username}`;

					if (targetUserData.adminDuty) {
						DefaultTagContent = `${_TEXT_R_RED}[ADMIN]${_TEXT_R_WHITE} ${targetUserData.adminName}`;
					}

					mp.game.graphics.drawText(DefaultTagContent, [x, y], {
						font: 4,
						color: [255, 255, 255, 255],
						scale: [0.325, 0.325],
						outline: false
					});
				}
			});
		})
	}
}

export default NameTags;
