import { TollBooth } from "@/@types";

export default class TollBooths {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly tollBoothSharedDataKey: string = "server:tollBooths:sharedDataKey";

    constructor() {
        mp.events.addDataHandler(TollBooths.tollBoothSharedDataKey, TollBooths.handleDataHandler);
    }

    private static handleDataHandler(barrier: ObjectMp, data: TollBooth) {
        if (!mp.objects.exists(barrier) || !data) return;

        mp.game.object.doorControl(barrier.model, barrier.position.x, barrier.position.y, barrier.position.z, data.isBoothActivated, barrier.rotation.x, barrier.rotation.y, barrier.rotation.z);

        mp.gui.chat.push(JSON.stringify(data));
    }
}