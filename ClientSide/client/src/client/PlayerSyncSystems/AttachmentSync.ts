import { AttachmentData } from "@/@types";

export default class AttachmentSync {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly _attachmentDataKey: string = "attachmentSync:dataKey";
    public static LoadedAttachments: Map<number, AttachmentData> = new Map<number, AttachmentData>();

    constructor() {
        mp.events.add({
            "entityStreamIn": AttachmentSync.handleStreamIn,
            "entityStreamOut": AttachmentSync.handleStreamOut
        });

        mp.events.addDataHandler(AttachmentSync._attachmentDataKey, AttachmentSync.handleDataHandler);
    }

    private static handleStreamIn(entity: EntityMp) {
        let attachData: AttachmentData = entity.getVariable(AttachmentSync._attachmentDataKey);

        if (attachData) {
            AttachmentSync.LoadedAttachments.set(entity.remoteId, attachData);

            AttachmentSync.attachObjects(entity.remoteId);
        }
    }

    private static handleStreamOut(entity: EntityMp) {
        let attachment: AttachmentData = entity.getVariable(AttachmentSync._attachmentDataKey);

        if (attachment) {
            let targetObj: ObjectMp = mp.objects.atHandle(attachment.object.handle);

            if (targetObj) {
                targetObj.destroy();
            }
        }
    }

    private static handleDataHandler(entity: EntityMp, data: AttachmentData) {
        if (entity.type != "player") return;

        if (!data) {
            let attachData: AttachmentData | undefined = AttachmentSync.LoadedAttachments.get(entity.remoteId);

            if (attachData && attachData.object) {
                let targetObj: ObjectMp = mp.objects.atHandle(attachData.object.handle);

                if (targetObj) {
                    targetObj.destroy();
                }
            }

            return;
        }

        if (data) {
            AttachmentSync.LoadedAttachments.set(entity.remoteId, data);

            AttachmentSync.attachObjects(entity.remoteId);
        }
    }

    private static async attachObjects(entityId: number) {
        let attachment: AttachmentData | undefined = AttachmentSync.LoadedAttachments.get(entityId);

        if (attachment) {
            let targetEntity: PlayerMp = mp.players.at(entityId);

            if (!mp.objects.atHandle(attachment?.object?.handle) && targetEntity) {

                let createdObject = mp.objects.new(mp.game.joaat(attachment.modelName), targetEntity.position, {
                    alpha: 255,
                    rotation: attachment.rotation
                });

                for (let i = 0; i < 15 && (!createdObject || createdObject.handle === 0); i++) {
                    await mp.game.waitAsync(100);
                }

                attachment.object = createdObject;

                mp.gui.chat.push(`Bone IDX: ${targetEntity.getBoneIndex(attachment.boneId)} || BNAME ${attachment.boneId}`);

                createdObject.attachTo(targetEntity.handle, targetEntity.getBoneIndex(attachment.boneId),
                    attachment.offset.x, attachment.offset.y, attachment.offset.z, attachment.rotation.x,
                    attachment.rotation.y, attachment.rotation.z, false, false, false, false, 2, true);
            }
        }
    }
}

