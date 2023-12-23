class SpeedCameras {
    public static LocalPlayer: PlayerMp;
    public static serverCameraTrigger: string = "server:handleSpeedCamera";

    constructor() {
        SpeedCameras.LocalPlayer = mp.players.local;

        mp.events.add("client:speedCameraTrigger", SpeedCameras.handleTriggerEvent);
        mp.events.add("client:speedCameraSound", SpeedCameras.handleSound);
    }

    public static handleSound() {
        mp.game.audio.playSoundFrontend(1, "Camera_Shoot", "Phone_Soundset_Franklin", true);

    }

    public static handleTriggerEvent() {
        if(SpeedCameras.LocalPlayer.vehicle && SpeedCameras.LocalPlayer.vehicle.getPedInSeat(-1) == SpeedCameras.LocalPlayer.handle) {
            mp.events.callRemote(SpeedCameras.serverCameraTrigger, SpeedCameras.LocalPlayer.vehicle.getSpeed());
        }
    }
}

export default SpeedCameras;