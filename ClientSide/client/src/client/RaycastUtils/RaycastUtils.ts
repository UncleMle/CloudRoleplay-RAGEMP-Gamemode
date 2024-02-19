import validateKeyPress from "@/PlayerMethods/validateKeyPress";

export default class RaycastUtils {
    private static LocalPlayer: PlayerMp = mp.players.local;

    public static getInFrontOfPlayer(maxDist: number = 4) {
        if (!validateKeyPress(true, true, true)) return;

        let startPosition = RaycastUtils.LocalPlayer.getBoneCoords(12844, 0.5, 0, 0);
        const res = mp.game.graphics.getScreenActiveResolution(1, 1);
        const coord: Vector3 = new mp.Vector3(res.x / 2, res.y / 2, 2 | 4 | 8);
        const secondPoint = mp.game.graphics.screen2dToWorld3d(coord);
        if (!secondPoint) return;

        startPosition.z -= 0.3;
        const target = mp.raycasting.testPointToPoint(startPosition, secondPoint, RaycastUtils.LocalPlayer, 2 | 4 | 8 | 16);

        if (
            target &&
            mp.game.gameplay.getDistanceBetweenCoords(
                target.position.x,
                target.position.y,
                target.position.z,
                RaycastUtils.LocalPlayer.position.x,
                RaycastUtils.LocalPlayer.position.y,
                RaycastUtils.LocalPlayer.position.z,
                false
            ) < maxDist
        )
            return target;
    }
}