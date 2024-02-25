import { InteractionPed } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import RaycastUtils from "@/RaycastUtils/RaycastUtils";

export default class NpcInteractions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static streamedNpcPeds: Map<number, InteractionPed> = new Map<number, InteractionPed>();
    public static readonly _npcSharedDataKey: string = "npcs:peds:sharedDataKey";

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

            mp.game.graphics.drawText(
                "Interact",
                [startBoneCoords.x, startBoneCoords.y, startBoneCoords.z + 0.13],
                {
                    font: 4,
                    color: [198, 163, 255, 160],
                    scale: [0.325, 0.325],
                    outline: false
                }
            );

            let secondPoint: Vector3 = NpcInteractions.LocalPlayer.getBoneCoords(0, 0, 0, 0);
            if (!secondPoint) return;

            let raycast: RaycastResult | undefined = RaycastUtils.getInFrontOfPlayer();

            if (!raycast || raycast && ped.ped.remoteId != (raycast.entity as EntityMp).remoteId) return;

            let pos: Vector3 = raycast.position;

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

            RaycastUtils.handleWheelMenu(ped.raycastMenuItems);

            ped.raycastMenuItems.forEach((rayItem, idx) => {
                let textSelected: string = RaycastUtils.wheelPosition === idx ? "[E] " : "~c~";

                mp.game.graphics.drawText(textSelected + rayItem, [startBoneCoords.x, startBoneCoords.y, startBoneCoords.z - (idx > 0 ? idx / 7 : 0)], {
                    scale: [0.3, 0.3],
                    outline: false,
                    color: [255, 255, 255, 255],
                    font: 4
                });
            });
        });
    }

    private static handleInteraction() {
        let raycast: RaycastResult | undefined = RaycastUtils.getInFrontOfPlayer();

        if (raycast) {
            let rayEntityId: number = (raycast.entity as EntityMp).remoteId;

            if (NpcInteractions.streamedNpcPeds.get(rayEntityId)) {
                mp.events.callRemote("server:npcPeds:recieveInteraction", RaycastUtils.rayMenu[RaycastUtils.wheelPosition]);
            }
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