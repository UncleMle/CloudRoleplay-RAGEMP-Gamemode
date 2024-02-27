import { RaycastInteraction } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import distBetweenCoords from "@/PlayerMethods/distanceBetweenCoords";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import RaycastUtils from "@/RaycastUtils/RaycastUtils";

export default class RaycastInteractions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static raycastInteractionPoints: RaycastInteraction[] = [];
    private static interactionServerEvent: string = "server:raycastInteractions:pointInteraction";
    private static readonly pedRaycastSharedKey: string = "server:raycastMenuSystems:pedKey";
    private static lookingAtInteractionPoint: RaycastInteraction | null = null;
    public static pedsalterted: number[] = [];

    constructor() {
        mp.events.add({
            "render": RaycastInteractions.handleRaycastRender,
            "client::raycastInteractions:loadPoints": RaycastInteractions.handlePointLoad,
            "client::raycastInteractions:loadOnePoint": RaycastInteractions.loadOnePoint
        });

        mp.keys.bind(_control_ids.EBIND, false, RaycastInteractions.handleKeyPress);
    }

    private static handleKeyPress() {
        if (!RaycastInteractions.lookingAtInteractionPoint || !validateKeyPress(true, true, true)) return;
        let pointId: number = RaycastInteractions.raycastInteractionPoints.indexOf(RaycastInteractions.lookingAtInteractionPoint);

        mp.events.callRemote(RaycastInteractions.interactionServerEvent, pointId, RaycastUtils.rayMenu[RaycastUtils.wheelPosition]);
    }

    private static handleRaycastRender() {
        if (RaycastInteractions.LocalPlayer.dimension != 0) return;

        mp.peds.forEachInStreamRange(p => {
            if (p.doesExist() && p.getVariable(RaycastInteractions.pedRaycastSharedKey)) {
                p.setAlpha(0, true);
                p.setAsEnemy(false);
                p.setCanBeTargetted(false);
            }
        });

        RaycastInteractions.raycastInteractionPoints.forEach(interactionPoint => {
            let targetPos: Vector3 = interactionPoint.raycastMenuPosition;
            let menuItems: string[] = interactionPoint.raycastMenuItems;

            if (!targetPos) return;

            if (distBetweenCoords(RaycastInteractions.LocalPlayer.position, targetPos) > 10) return;

            mp.game.graphics.drawText(
                interactionPoint.menuTitle,
                [targetPos.x, targetPos.y, targetPos.z + 0.13],
                {
                    font: 4,
                    color: [198, 163, 255, 160],
                    scale: [0.325, 0.325],
                    outline: false
                }
            );

            RaycastInteractions.lookingAtInteractionPoint = null;

            let getRayMenu: RaycastResult | undefined = RaycastUtils.getInFrontOfPlayer();

            if (!getRayMenu) return;

            let targetPed: PedMp = mp.peds.atHandle((getRayMenu.entity as PedMp).handle);

            if (!targetPed) return;

            let interactId: number = targetPed.getVariable(RaycastInteractions.pedRaycastSharedKey);

            if (!targetPed.doesExist() || targetPed.doesExist() && targetPed.getVariable(RaycastInteractions.pedRaycastSharedKey) === undefined) return;

            if (RaycastInteractions.raycastInteractionPoints.indexOf(interactionPoint) !== interactId) return;

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

    private static loadOnePoint(point: string) {
        let newPoint: RaycastInteraction = JSON.parse(point);

        RaycastInteractions.raycastInteractionPoints.push(newPoint);
    }

}