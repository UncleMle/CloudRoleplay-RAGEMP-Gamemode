import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE, _control_ids } from "@/Constants/Constants";
import PhoneSystem from "@/PhoneSystem/PhoneSystem";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { CharacterData } from "@/@types";

export default class KeyPressActions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    private static cooldown_seconds: number = 0.5;
    private static cooldown: boolean;

    constructor() {
        mp.keys.bind(_control_ids.Y, false, () => KeyPressActions.handleKeyPressed("Y"));
        mp.keys.bind(_control_ids.F4, false, () => KeyPressActions.handleKeyPressed("F4"));
    }

    private static getArgs(): boolean[] {
        let args: boolean[] = [
            false, false, false, false, false, false
        ];

        let charData: CharacterData | undefined = getUserCharacterData();
    
        if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
            args[0] = true;
        }

        if (mp.players.local.getVariable(PhoneSystem._phoneStatusIdentifer)) {
            args[1] = true;
        }

        if (mp.game.ui.isPauseMenuActive()) {
            args[2] = true;
        }

        if (mp.players.local.isTypingInTextChat) {
            args[3] = true;
        }

        if (mp.players.local.vehicle) {
            args[4] = true;
        }

        if (charData && charData.injured_timer > 0) {
            args[5] = true;
        }

        return args;
    }

    private static cooldownStart() {
        KeyPressActions.cooldown = true;

        setTimeout(() => {
            KeyPressActions.cooldown = false;
        }, KeyPressActions.cooldown_seconds * 1000);
    }

    private static handleKeyPressed(key: string) {
        if(!KeyPressActions.cooldown) {
            KeyPressActions.cooldownStart();
            mp.events.callRemote("server:handleKeyPress:" + key, ...KeyPressActions.getArgs());
        }
    }
}