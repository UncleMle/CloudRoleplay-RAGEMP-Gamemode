import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from "@/Constants/Constants";
import PhoneSystem from "@/PhoneSystem/PhoneSystem";
import getUserCharacterData from "./getUserCharacterData";
import { CharacterData } from "@/@types";

const validateKeyPress = (testForVehicle: boolean = false, testForPhone: boolean = true, testForInjured: boolean = false): boolean => {
    let localCharData: CharacterData | undefined = getUserCharacterData();

    if(mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {
        return false;
    }

    if(testForPhone && mp.players.local.getVariable(PhoneSystem._phoneStatusIdentifer)) {
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

    if(testForInjured && localCharData && localCharData.injuredTimer > 0) {
        return false;
    }

    return true;
}

export default validateKeyPress;