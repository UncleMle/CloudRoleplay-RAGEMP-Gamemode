import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE, _control_ids } from "@/Constants/Constants";
import PhoneSystem from "@/PhoneSystem/PhoneSystem";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { CharacterData } from "@/@types";
import { KeyType } from "@/enums";

export default class KeyPressActions {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly KeyEvent: string = "server:handleKeyPress";
    private static cooldown_seconds: number = 0.5;
    private static cooldown: boolean;

    constructor() {
        setInterval(() => {

            if(mp.keys.isDown(_control_ids.LCtrlBind) && mp.keys.isDown(_control_ids.DBIND)) {
                KeyPressActions.handleKeyPressed(KeyType.KEY_CTRL_D);
            }

        }, 100);

        mp.keys.bind(_control_ids.Y, false, () => KeyPressActions.handleKeyPressed(KeyType.KEY_Y));
        mp.keys.bind(_control_ids.F4, false, () => KeyPressActions.handleKeyPressed(KeyType.KEY_F4));
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

    private static handleKeyPressed(key: KeyType) {
        if (!KeyPressActions.cooldown) {
            KeyPressActions.cooldownStart();

            let args: boolean[] = KeyPressActions.getArgs();

            if (!args.find(arg => arg)) {
                mp.events.callRemote(KeyPressActions.KeyEvent, key);
            }
        }
    }
}