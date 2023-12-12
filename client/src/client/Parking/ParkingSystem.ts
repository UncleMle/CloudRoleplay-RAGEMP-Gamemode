class ParkingSystem {
    public static LocalPlayer: PlayerMp;
    public static _parkingLotIdentifier: string = "parkingLotData";
    public static _retrievalIdentifier: string = "retreivalParkingData";

    constructor() {
        ParkingSystem.LocalPlayer = mp.players.local;
        mp.events.add("render", ParkingSystem.handleRender);
    }

    public static handleRender() {
        let parkingCol = ParkingSystem.LocalPlayer.getVariable(ParkingSystem._parkingLotIdentifier);
        let retrieveCol = ParkingSystem.LocalPlayer.getVariable(ParkingSystem._retrievalIdentifier)

        if(parkingCol) {
            mp.gui.chat.push("Parking Col " + JSON.stringify(parkingCol));
        }

        if(retrieveCol) {
            mp.gui.chat.push("Retrieve Col " + JSON.stringify(retrieveCol));
        }

    }
}

export default ParkingSystem;