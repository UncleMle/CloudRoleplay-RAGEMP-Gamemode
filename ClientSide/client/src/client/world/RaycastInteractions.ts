import { RaycastInteraction } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import distBetweenCoords from "@/PlayerMethods/distanceBetweenCoords";
import RaycastUtils from "@/RaycastUtils/RaycastUtils";

export default class RaycastInteractions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static raycastInteractionPoints: RaycastInteraction[] = [];
    private static interactionServerEvent: string = "server:raycastInteractions:pointInteraction";
    private static lookingAtInteractionPoint: RaycastInteraction | null = null;
    private static readonly targetDist: number = 7;

    constructor() {
        mp.events.add({
            "client::raycastInteractions:loadPoints": RaycastInteractions.handlePointLoad,
            "render": RaycastInteractions.handleRaycastRender
        });

        mp.keys.bind(_control_ids.EBIND, false, RaycastInteractions.handleKeyPress);
    }

    private static handleKeyPress() {
        if (!RaycastInteractions.lookingAtInteractionPoint) return;
        let pointId: number = RaycastInteractions.raycastInteractionPoints.indexOf(RaycastInteractions.lookingAtInteractionPoint);

        mp.events.callRemote(RaycastInteractions.interactionServerEvent, pointId, RaycastUtils.rayMenu[RaycastUtils.wheelPosition]);
    }

    private static handleRaycastRender() {
        RaycastInteractions.raycastInteractionPoints.forEach(interactionPoint => {
            let targetPos: Vector3 = interactionPoint.raycastMenuPosition;
            let menuItems: string[] = interactionPoint.raycastMenuItems;

            if (!targetPos) return;

            if (distBetweenCoords(RaycastInteractions.LocalPlayer.position, targetPos) > 10) return;

            mp.game.graphics.drawText(
                "Interaction Point",
                [targetPos.x, targetPos.y, targetPos.z + 0.13],
                {
                    font: 4,
                    color: [198, 163, 255, 160],
                    scale: [0.325, 0.325],
                    outline: false
                }
            );

            const camera: CameraMp = mp.cameras.new("gameplay");

            let position: Vector3 = camera.getCoord();

            let direction: Vector3 = camera.getDirection();

            let farAway = new mp.Vector3((direction.x * RaycastInteractions.targetDist) + (position.x), (direction.y * RaycastInteractions.targetDist) + (position.y), (direction.z * RaycastInteractions.targetDist) + (position.z));

            if (distBetweenCoords(farAway, targetPos) > 1.5) {
                RaycastInteractions.lookingAtInteractionPoint = null;
                return;
            }

            RaycastInteractions.lookingAtInteractionPoint = interactionPoint;

            RaycastUtils.handleWheelMenu(interactionPoint.raycastMenuItems);

            menuItems.forEach((rayItem, idx) => {
                let textSelected: string = RaycastUtils.wheelPosition === idx ? "[E] " : "~c~";

                mp.game.graphics.drawText(textSelected + rayItem, [targetPos.x, targetPos.y, targetPos.z - (idx > 0 ? idx / 7 : 0)], {
                    scale: [0.3, 0.3],
                    outline: false,
                    color: [255, 255, 255, 255],
                    font: 4
                });
            });
        });
    }

    private static handlePointLoad(pointData: string) {
        RaycastInteractions.raycastInteractionPoints = JSON.parse(pointData);
    }

}