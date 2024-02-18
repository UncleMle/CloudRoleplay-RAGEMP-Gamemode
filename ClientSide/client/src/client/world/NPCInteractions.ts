import { InteractionPed } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

export default class NpcInteractions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static streamedNpcPeds: Map<number, InteractionPed> = new Map<number, InteractionPed>();
    public static readonly _npcSharedDataKey: string = "npcs:peds:sharedDataKey";
    public static raycastMenu: string[];
    public static wheelPosition: number = 0;

    constructor() {
        mp.events.add({
            render: NpcInteractions.handleRender,
            entityStreamIn: NpcInteractions.handleStreamIn,
            entityStreamOut: NpcInteractions.handleStreamOut
        });

        mp.keys.bind(_control_ids.EBIND, false, NpcInteractions.handleInteraction);
    }

    private static handleRender() {
        NpcInteractions.streamedNpcPeds.forEach(ped => {
            let pedPos: Vector3 = ped.ped.position;

            if (mp.game.gameplay.getDistanceBetweenCoords(
                pedPos.x,
                pedPos.y,
                pedPos.z,
                NpcInteractions.LocalPlayer.position.x,
                NpcInteractions.LocalPlayer.position.y,
                NpcInteractions.LocalPlayer.position.z,
                true
            ) > 6) return;

            let startBoneCoords: Vector3 = ped.ped.getBoneCoords(0, 0, 0, 0);
            let headPos: Vector3 = ped.ped.getBoneCoords(12844, 0, 0, 0);

            if (headPos) {
                let headDraw: {
                    x: number,
                    y: number
                } = mp.game.graphics.world3dToScreen2d(headPos);

                if (!headDraw) return;

                mp.game.graphics.drawText(ped.pedHeadName, [headDraw.x, headDraw.y - 0.057], {
                    scale: [0.3, 0.3],
                    outline: false,
                    color: [255, 255, 255, 255],
                    font: 4
                });
            }

            let secondPoint: Vector3 = NpcInteractions.LocalPlayer.getBoneCoords(0, 0, 0, 0);
            if (!secondPoint) return;

            let target: RaycastResult | undefined = NpcInteractions.getLocalNpc();

            if (!target) return;

            let pos: Vector3 = target.position;

            let dist: number = mp.game.gameplay.getDistanceBetweenCoords(
                pos.x,
                pos.y,
                pos.z,
                NpcInteractions.LocalPlayer.position.x,
                NpcInteractions.LocalPlayer.position.y,
                NpcInteractions.LocalPlayer.position.z,
                true
            );

            if (dist > 3) return;

            NpcInteractions.handleWheelMenu(ped.raycastMenuItems);

            ped.raycastMenuItems.forEach((rayItem, idx) => {
                let textSelected: string = NpcInteractions.wheelPosition == idx ? "[E] " : "~c~";

                mp.game.graphics.drawText(textSelected + rayItem, [startBoneCoords.x, startBoneCoords.y, startBoneCoords.z - (idx > 0 ? idx / 7 : 0)], {
                    scale: [0.3, 0.3],
                    outline: false,
                    color: [255, 255, 255, 255],
                    font: 4
                });
            });
        });
    }

    private static getLocalNpc() {
        if (!validateKeyPress(true, true, true)) return;

        let startPosition = NpcInteractions.LocalPlayer.getBoneCoords(12844, 0.5, 0, 0);
        const res = mp.game.graphics.getScreenActiveResolution(1, 1);
        const coord: Vector3 = new mp.Vector3(res.x / 2, res.y / 2, 2 | 4 | 8);
        const secondPoint = mp.game.graphics.screen2dToWorld3d(coord);
        if (!secondPoint) return;

        startPosition.z -= 0.3;
        const target = mp.raycasting.testPointToPoint(startPosition, secondPoint, NpcInteractions.LocalPlayer, 2 | 4 | 8 | 16);

        if (
            target &&
            mp.game.gameplay.getDistanceBetweenCoords(
                target.position.x,
                target.position.y,
                target.position.z,
                NpcInteractions.LocalPlayer.position.x,
                NpcInteractions.LocalPlayer.position.y,
                NpcInteractions.LocalPlayer.position.z,
                false
            ) < 3
        )
            return target;
    }

    private static handleInteraction() {
        if (NpcInteractions.getLocalNpc()) {
            mp.events.callRemote("server:npcPeds:recieveInteraction", NpcInteractions.raycastMenu[NpcInteractions.wheelPosition]);
        }
    }

    private static handleWheelMenu(rayMenu: string[]) {
        NpcInteractions.raycastMenu = rayMenu;
        mp.game.ui.weaponWheelIgnoreSelection();

        if (rayMenu.length === 1) return NpcInteractions.wheelPosition = 0;

        let wheelDown = mp.game.controls.isControlPressed(0, 14);
        let wheelUp = mp.game.controls.isControlPressed(0, 15);

        if (wheelUp) {
            if (NpcInteractions.wheelPosition >= rayMenu.length - 1) return NpcInteractions.wheelPosition = rayMenu.length - 1;
            NpcInteractions.wheelPosition++;
        }
        if (wheelDown) {
            if (NpcInteractions.wheelPosition <= 0) return NpcInteractions.wheelPosition = 0;
            NpcInteractions.wheelPosition--;
        }
    }

    private static handleStreamOut(entity: EntityMp) {
        let interactionData: InteractionPed | undefined = entity.getVariable(NpcInteractions._npcSharedDataKey);
        if (entity.type !== "ped" || !interactionData) return;

        NpcInteractions.streamedNpcPeds.delete(interactionData.ped.remoteId);
    }

    private static handleStreamIn(entity: EntityMp) {
        let interactionData: InteractionPed | undefined = entity.getVariable(NpcInteractions._npcSharedDataKey);
        if (entity.type !== "ped" || !interactionData) return;

        interactionData.ped = entity as PedMp;

        NpcInteractions.streamedNpcPeds.set(interactionData.ped.remoteId, interactionData);
    }
}