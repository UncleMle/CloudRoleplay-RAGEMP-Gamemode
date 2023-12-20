class VehicleRadar {
    public static LocalPlayer: PlayerMp;

    constructor() {
        VehicleRadar.LocalPlayer = mp.players.local;

        mp.events.add('render', VehicleRadar.handleRender);
    }

    public static handleRender() {
        const startPosition = mp.players.local.getBoneCoords(12844, 0.5, 0, 0);
        const endPosition = new mp.Vector3(0, 0, 75);

        const hitData = mp.raycasting.testPointToPoint(startPosition, endPosition);
        if (!hitData) {
            mp.game.graphics.drawLine(startPosition.x, startPosition.y, startPosition.z, endPosition.x, endPosition.y, endPosition.z, 255, 255, 255, 255); // Is in line of sight
        } else {
            mp.game.graphics.drawLine(startPosition.x, startPosition.y, startPosition.z, endPosition.x, endPosition.y, endPosition.z, 255, 0, 0, 255); // Is NOT in line of sight
        }
    }
}

export default VehicleRadar;