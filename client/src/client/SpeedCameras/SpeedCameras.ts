class SpeedCameras {
	public static LocalPlayer: PlayerMp;
	public static serverCameraTrigger: string = 'server:handleSpeedCamera';
    public static flashDuration: number = 200;

	constructor() {
		SpeedCameras.LocalPlayer = mp.players.local;

		mp.events.add('client:speedCameraTrigger', SpeedCameras.handleTriggerEvent);
		mp.events.add('client:speedCameraSound', SpeedCameras.handleSound);
	}

	public static async handleSound() {
		mp.game.audio.playSoundFrontend(1, 'Camera_Shoot', 'Phone_Soundset_Franklin', true);

        mp.game.graphics.requestStreamedTextureDict("heistflash", true);

        const flashInterval = setInterval(() => {
            mp.game.graphics.drawSprite("heistflash", "heist_flash", 0.5, 0.5, 1.0, 1.0, 0.0, 255, 255, 255, 180, false);
        }, 0);

        await mp.game.waitAsync(SpeedCameras.flashDuration);

        clearInterval(flashInterval);
	}

	public static handleTriggerEvent() {
		if (SpeedCameras.LocalPlayer.vehicle && SpeedCameras.LocalPlayer.vehicle.getPedInSeat(-1) == SpeedCameras.LocalPlayer.handle) {
			mp.events.callRemote(SpeedCameras.serverCameraTrigger, SpeedCameras.LocalPlayer.vehicle.getSpeed());
		}
	}
}

export default SpeedCameras;
