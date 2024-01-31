export default class Dmv {
    public static LocalPlayer: PlayerMp = mp.players.local;

    constructor() {
        mp.events.add("render", Dmv.handleRender);
    }

    private static handleRender() {
        let isInLane: number = mp.game.invokeFloat('0xDB89591E290D9182', Dmv.LocalPlayer);

        mp.game.graphics.drawText("lane " + isInLane, [0.5, 0.94], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.45, 0.45],
            outline: false
        });

    }
}