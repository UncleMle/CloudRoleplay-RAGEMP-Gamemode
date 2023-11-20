import { UserData } from "../@types";
import { _sharedCharacterDataIdentifier } from "../Constants/Constants";

const getUserData = (): UserData | undefined => {
	let sharedData = mp.players.local.getVariable(_sharedCharacterDataIdentifier);
	if (!sharedData) return;

	return sharedData as UserData;

}

export default getUserData;
