import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from "@/Constants/Constants";

const validateKeyPress = (testForVehicle: boolean = false): boolean => {
    if(mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
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