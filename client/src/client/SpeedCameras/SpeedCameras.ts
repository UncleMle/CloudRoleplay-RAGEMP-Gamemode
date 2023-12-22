class SpeedCameras {
    public static LocalPlayer: PlayerMp;
    public static serverCameraTrigger: string = "server:handleSpeedCamera";

    constructor() {
        mp.events.add("client:speedCameraTrigger", SpeedCameras.handleTriggerEvent);
    }

    public static handleTriggerEvent() {
        if(SpeedCameras.LocalPlayer.vehicle && SpeedCameras.LocalPlayer.vehicle.getPedInSeat(-1) == SpeedCameras.LocalPlayer.handle) {
            mp.events.callRemote(SpeedCameras.serverCameraTrigger, SpeedCameras.LocalPlayer.vehicle.getSpeed());
        }
    }
}

export default SpeedCameras;