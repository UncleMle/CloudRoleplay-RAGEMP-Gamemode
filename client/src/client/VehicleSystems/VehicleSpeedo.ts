import BrowserSystem from "@/BrowserSystem/BrowserSystem";

class VehicleSpeedo {
    public static LocalPlayer: PlayerMp;

    constructor() {
        VehicleSpeedo.LocalPlayer = mp.players.local;

        mp.events.add("render", VehicleSpeedo.handleRender);
    }

    public static handleRender() {
        if(VehicleSpeedo.LocalPlayer.vehicle && BrowserSystem._browserInstance) {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "speedoUi",
                status: true
            })`);
        }
    }
}

export default VehicleSpeedo;