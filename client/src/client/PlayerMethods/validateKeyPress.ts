import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from "@/Constants/Constants";
import PhoneSystem from "@/PhoneSystem/PhoneSystem";

const validateKeyPress = (testForVehicle: boolean = false): boolean => {
    if(mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
        return false;
    }

    if(mp.players.local.getVariable(PhoneSystem._phoneStatusIdentifer)) {
        return false;
    }

    if(mp.game.ui.isPauseMenuActive()) {
        return false;
    }

    if(mp.players.local.isTypingInTextChat) {
        return false;
    }

    if(testForVehicle && mp.players.local.vehicle) {
        return false;
    }

    return true;
}

export default validateKeyPress;