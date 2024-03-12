import { RouletteTable } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import RaycastUtils from "@/RaycastUtils/RaycastUtils";

export default class RouletteTables {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static rouletteTables: Map<number, RouletteTable> = new Map<number, RouletteTable>();
    private static readonly _rouletteTableSharedDataKey: string = "server:casinoSystem:rouletteTableData";
    private static readonly _rollRouletteTableServerEvent: string = "server:casinoSystem:rollRouletteTable";

    constructor() {
        mp.events.add("render", RouletteTables.handleRender);

        mp.keys.bind(_control_ids.EBIND, false, RouletteTables.handleKeyPress);

        mp.events.addDataHandler(RouletteTables._rouletteTableSharedDataKey, RouletteTables.handleRouletteSpin);
    }

    private static handleRouletteSpin(table: ObjectMp, data: RouletteTable) {
        if (table.type !== "object" || !data) return

        if (!data.beingRolled) return;

        if (table.ballObject && mp.objects.exists(table.ballObject)) table.ballObject.destroy();

        let pos: Vector3 = table.position;

        let ball: ObjectMp = mp.objects.new(mp.game.joaat('vw_prop_roulette_ball'), new mp.Vector3(pos.x - 0.734742, pos.y - 0.16617, pos.z + 1.0715));

        table.ballObject = ball;

        ball.attachTo(table.handle, 0, 0, 0, 0, 0, 0, 0, true, true, false, false, 0, false);

        let lib: string = 'anim_casino_b@amb@casino@games@roulette@table';

        ball.position = new mp.Vector3(pos.x - 0.734742, pos.y - 0.16617, pos.z + 1.0715);
        ball.rotation = new mp.Vector3(0, 0, 32.6);

        ball.playAnim('intro_ball', lib, 1000.0, false, true, true, 0, 136704);
        ball.playAnim('loop_ball', lib, 1000.0, false, true, false, 0, 136704);

        table.playAnim('intro_wheel', lib, 1000.0, false, true, true, 0, 136704);
        table.playAnim('loop_wheel', lib, 1000.0, false, true, false, 0, 136704);

        ball.playAnim('exit_28_ball', lib, 1000.0, false, true, false, 0, 136704);
        table.playAnim('exit_28_wheel', lib, 1000.0, false, true, false, 0, 136704);
    }

    private static handleRender() {
        if (!validateKeyPress(true, true, true)) return;

        let rayEntity: RouletteTable | null = RouletteTables.getRaycastRouletteTable();

        if (!rayEntity) return;

        mp.game.graphics.drawText("[E] to spin roulette table", [rayEntity.pos_x, rayEntity.pos_y, rayEntity.pos_z], {
            scale: [0.3, 0.3],
            outline: false,
            color: [255, 255, 255, 255],
            font: 4
        });
    }

    private static handleKeyPress() {
        if (!validateKeyPress(true, true, true)) return;

        let rayEntity: RouletteTable | null = RouletteTables.getRaycastRouletteTable();

        if (!rayEntity) return;

        mp.events.callRemote(RouletteTables._rollRouletteTableServerEvent, rayEntity.roulette_table_id);
    }

    private static getRaycastRouletteTable(): RouletteTable | null {
        let raycast: RaycastResult | undefined = RaycastUtils.getInFrontOfPlayer();

        if (!raycast || !raycast?.entity) return null;

        if (!mp.objects.exists(raycast.entity as ObjectMp)) return null;

        let rayEntityData: RouletteTable | null = (raycast.entity as EntityMp).getVariable(RouletteTables._rouletteTableSharedDataKey);

        if (!rayEntityData) return null;

        return rayEntityData;
    }
}