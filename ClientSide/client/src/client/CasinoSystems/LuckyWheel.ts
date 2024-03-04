import GuiSystem from "@/BrowserSystem/GuiSystem";
import distBetweenCoords from "@/PlayerMethods/distanceBetweenCoords";
import VehicleManager from "@/VehicleSystems/VehicleManager";

export default class LuckyWheel {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static luckyWheelInteractionPos: Vector3 = new mp.Vector3(1110.8710, 228.8737, -49.6358);
    public static wheelObjectPos: Vector3 = new mp.Vector3(1111.052, 229.8579, -49.133);
    public static vehiclePodium: Vector3 = new mp.Vector3(1099.5, 219.9, -48.7);
    public static vehiclePodiumTextDraw: Vector3 = new mp.Vector3(1103.2, 216.3, -49.0);
    public static readonly interactionRadius: number = 1;
    public static isNearWheel: boolean;
    public static interactionButton: number = 0x45; // E
    private static loadIpls: string[] = [
        'vw_casino_main',
        'hei_dlc_windows_casino',
        'hei_dlc_casino_door',
        'hei_dlc_casino_aircon'
    ];
    private static serverEvents: string[] = [
        "server:casinoSystems:luckyWheel:spin",
        "server:casinoSystems:luckyWheel:finishSpin",
        "server:casinoSystems:luckywheel:arriveTo"
    ];
    private static animations: string[] = [
        'Enter_to_ArmRaisedIDLE',
        'ArmRaisedIDLE_to_SpinningIDLE_High',
        'SpinningIDLE_High',
        'Win_Big'
    ];
    private static isWheelSpinning: boolean;
    private static model: ObjectMp;
    public static wheelPrizeVehicleName: string = "N/A";
    public static wheelPrizeVehicle: VehicleMp;
    public static wheelPrizeRotation: number = 180;
    public static rotationCycle: boolean;

    constructor() {
        mp.events.add({
            "render": LuckyWheel.handleRender,
            "client:luckywheel:arriveToWheel": LuckyWheel.handleArriveToWheel,
            "client:luckyWheel:spinWheel": LuckyWheel.handleWheelSpin,
            "client:luckyWheel:spawnPrizeVeh": LuckyWheel.spawnPrizeInVehicle,
            "client:luckyWheel:vehiclePrizeAnim": LuckyWheel.playVehicleWinningAnimation
        });

        LuckyWheel.model = mp.objects.new(mp.game.joaat("vw_prop_vw_luckywheel_02a"), LuckyWheel.wheelObjectPos);

        for (let i = 0; i < LuckyWheel.loadIpls.length; i++) {
            mp.game.streaming.requestIpl(LuckyWheel.loadIpls[i]);
        }
    }

    private static spawnPrizeInVehicle(vehicleName: string) {
        LuckyWheel.wheelPrizeVehicleName = vehicleName;

        if (LuckyWheel.wheelPrizeVehicle && mp.vehicles.exists(LuckyWheel.wheelPrizeVehicle)) {
            LuckyWheel.wheelPrizeVehicle.destroy();
        }

        let primary: number = Math.floor(Math.random() * 255);
        let secondary: number = Math.floor(Math.random() * 255);

        LuckyWheel.wheelPrizeVehicle = VehicleManager.createVehicle(vehicleName, LuckyWheel.vehiclePodium, primary, secondary, true, "PODIUM");
    }

    private static rotatePrizeVehicle() {
        if (!LuckyWheel.wheelPrizeVehicle || !mp.vehicles.exists(LuckyWheel.wheelPrizeVehicle)) return;

        LuckyWheel.wheelPrizeRotation += 0.2;

        LuckyWheel.wheelPrizeVehicle.setHeading(LuckyWheel.wheelPrizeRotation);
    }

    private static renderPrizeVehicleText() {
        if (!LuckyWheel.wheelPrizeVehicle || !mp.vehicles.exists(LuckyWheel.wheelPrizeVehicle)) return;

        if (distBetweenCoords(LuckyWheel.LocalPlayer.position, LuckyWheel.vehiclePodiumTextDraw) > 12) return;

        let displayName: string = mp.game.vehicle.getDisplayNameFromVehicleModel(LuckyWheel.wheelPrizeVehicle.model);;

        let textPos: Vector3 = LuckyWheel.vehiclePodiumTextDraw;

        mp.game.graphics.drawText("Win a ~y~" + displayName + "~w~ by spinning the wheel!", [textPos.x, textPos.y, textPos.z], {
            font: 4,
            scale: [0.35, 0.35],
            color: [255, 255, 255, 255]
        });
    }

    private static async playVehicleWinningAnimation() {
        GuiSystem.toggleHudComplete(false, false, false);

        let vehicleCam = mp.cameras.new('default', LuckyWheel.vehiclePodiumTextDraw, new mp.Vector3(0, 0, 0), 40);
        vehicleCam.pointAtCoord(LuckyWheel.vehiclePodium.x, LuckyWheel.vehiclePodium.y, LuckyWheel.vehiclePodium.z);

        mp.game.cam.renderScriptCams(true, true, 3000, false, false);
    
        await mp.game.waitAsync(7000);

        if(vehicleCam && mp.cameras.exists(vehicleCam)) vehicleCam.destroy();

        mp.game.cam.renderScriptCams(false, true, 2000, false, false);
        
        GuiSystem.toggleHudComplete(true);
    }

    private static getDictionary() {
        return LuckyWheel.LocalPlayer.getModel() == 1885233650 ? 'ANIM_CASINO_A@AMB@CASINO@GAMES@LUCKY7WHEEL@MALE' : 'ANIM_CASINO_A@AMB@CASINO@GAMES@LUCKY7WHEEL@FEMALE';
    }

    private static async handleArriveToWheel(wheelIndex: number) {
        const dict: string = LuckyWheel.getDictionary();

        mp.game.streaming.requestAnimDict(dict);
        while (!mp.game.streaming.hasAnimDictLoaded(dict)) {
            await mp.game.waitAsync(0);
        }

        if (LuckyWheel.LocalPlayer.getScriptTaskStatus(2106541073) === 1 || LuckyWheel.LocalPlayer.getScriptTaskStatus(2106541073) === 0) return;

        const offset = mp.game.ped.getAnimInitialOffsetPosition(dict, LuckyWheel.animations[0], 1111.052, 229.8492, -50.6409, 0, 0, 0, 0, 2);

        LuckyWheel.LocalPlayer.taskGoStraightToCoord(offset.x, offset.y, offset.z, 1, 8000, 317, 0.001);

        while (!(LuckyWheel.LocalPlayer.getScriptTaskStatus(2106541073) == 7 || LuckyWheel.LocalPlayer.isAtCoord(offset.x, offset.y, offset.z, 0.1, 0.0, 0.0, false, true, 0))) {
            await mp.game.waitAsync(0);
        }

        LuckyWheel.LocalPlayer.taskPlayAnim(dict, LuckyWheel.animations[0], 4, -1000, -1, 1048576, 0, false, true, false);
        let isGoing;

        while (true) {
            if (LuckyWheel.LocalPlayer.isPlayingAnim(dict, LuckyWheel.animations[0], 3) && LuckyWheel.LocalPlayer.getAnimCurrentTime(dict, LuckyWheel.animations[0]) > 0.97) {
                LuckyWheel.LocalPlayer.taskPlayAnim(dict, LuckyWheel.animations[1], 4, -1000, -1, 1048576, 0, false, true, false);
            }
            if (LuckyWheel.LocalPlayer.isPlayingAnim(dict, LuckyWheel.animations[1], 3)) {
                if (!isGoing && LuckyWheel.LocalPlayer.getAnimCurrentTime(dict, LuckyWheel.animations[1]) > 0.04) {
                    isGoing = true;
                    LuckyWheel.handleWheelSpin(wheelIndex, true);
                    mp.events.callRemote(LuckyWheel.serverEvents[0]);
                }
                if (LuckyWheel.LocalPlayer.getAnimCurrentTime(dict, LuckyWheel.animations[1]) > 0.8) {
                    LuckyWheel.LocalPlayer.taskPlayAnim(dict, LuckyWheel.animations[2], 8.0, 1.0, -1, 1, 1.0, false, false, false);
                    break;
                }
            }
            await mp.game.waitAsync(0);
        }
    }

    private static async handleWheelSpin(wheelIndex: number, isOwner: boolean) {
        if (LuckyWheel.isWheelSpinning) return;

        if(!LuckyWheel.model || !mp.objects.exists(LuckyWheel.model)) LuckyWheel.model = mp.objects.new(mp.game.joaat("vw_prop_vw_luckywheel_02a"), LuckyWheel.wheelObjectPos);

        LuckyWheel.isWheelSpinning = true;
        let spins: number = 320, maxSpeed = 2.25;
        const speed: number = maxSpeed / (spins * 2 + (wheelIndex + LuckyWheel.model.getRotation(1).y / 18) * 16 + 1);
        mp.game.audio.playSoundFromCoord(1, 'Spin_Start', LuckyWheel.wheelObjectPos.x, LuckyWheel.wheelObjectPos.y, LuckyWheel.wheelObjectPos.z, 'dlc_vw_casino_lucky_wheel_sounds', true, 0, false);

        while (true) {
            if (spins <= 0) {
                maxSpeed -= speed;
                LuckyWheel.model.setRotation(0, LuckyWheel.model.getRotation(1).y - maxSpeed, 0, 2, true);
                if (maxSpeed <= 0) {
                    LuckyWheel.model.setRotation(0, Math.round(LuckyWheel.model.getRotation(1).y), 0, 2, true);
                    mp.game.audio.playSoundFromCoord(1, 'Win', LuckyWheel.wheelObjectPos.x, LuckyWheel.wheelObjectPos.y, LuckyWheel.wheelObjectPos.z, "dlc_vw_casino_lucky_wheel_sounds", true, 0, false);
                    LuckyWheel.isWheelSpinning = false;

                    if (isOwner) {
                        mp.events.callRemote(LuckyWheel.serverEvents[1]);
                        LuckyWheel.LocalPlayer.taskPlayAnim(LuckyWheel.getDictionary(), LuckyWheel.animations[3], 4, -1000, -1, 1048576, 0, false, true, false);


                        while (true) {
                            if (LuckyWheel.LocalPlayer.isPlayingAnim(LuckyWheel.getDictionary(), LuckyWheel.animations[3], 3) && LuckyWheel.LocalPlayer.getAnimCurrentTime(LuckyWheel.getDictionary(), LuckyWheel.animations[3]) > 0.75) {
                                LuckyWheel.LocalPlayer.clearTasks();
                                break;
                            }
                            await mp.game.waitAsync(0);
                        }

                    }
                    break;
                }
            }
            else {
                spins--;
                LuckyWheel.model.setRotation(0, LuckyWheel.model.getRotation(1).y - maxSpeed, 0, 2, true);
            }
            await mp.game.waitAsync(5);
        }
    }

    private static handleOnClick() {
        if (LuckyWheel.isWheelSpinning) {
            mp.game.graphics.notify('Lucky wheel is already spinning!');
            return;
        }

        mp.events.callRemote(LuckyWheel.serverEvents[2]);
    }

    private static handleRender() {
        LuckyWheel.rotatePrizeVehicle();
        LuckyWheel.renderPrizeVehicleText();

        let playerPos: Vector3 = LuckyWheel.LocalPlayer.position;
        let wheelPos: Vector3 = LuckyWheel.luckyWheelInteractionPos;

        if (mp.game.gameplay.getDistanceBetweenCoords(playerPos.x, playerPos.y, playerPos.z, wheelPos.x, wheelPos.y, wheelPos.z, true) < LuckyWheel.interactionRadius) {
            if (!LuckyWheel.isNearWheel) {
                LuckyWheel.isNearWheel = true;
                mp.keys.bind(LuckyWheel.interactionButton, false, LuckyWheel.handleOnClick);
                LuckyWheel.handleUserNotify('Press ~INPUT_CONTEXT~ to spin lucky wheel');
            }
        }
        else if (LuckyWheel.isNearWheel) {
            LuckyWheel.isNearWheel = false;
            mp.keys.unbind(LuckyWheel.interactionButton, false, LuckyWheel.handleOnClick);
            mp.game.ui.clearHelp(true);
        }
    }

    private static handleUserNotify(text: string) {
        mp.game.ui.setTextComponentFormat('STRING');
        mp.game.ui.addTextComponentSubstringWebsite(text);
        mp.game.ui.displayHelpTextFromStringLabel(0, true, true, 1000);
    }
}