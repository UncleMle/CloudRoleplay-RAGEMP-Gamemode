const validateKeyPress = (testForVehicle: boolean = false): boolean => {
    if(mp.players.local.isTypingInTextChat) {
        return false;
    }

    if(testForVehicle && mp.players.local.vehicle) {
        return false;
    }

    return true;
}

export default validateKeyPress;