import { UserData } from "../@types";
import { _sharedAccountDataIdentifier } from "../Constants/Constants";

const getUserData = (): UserData | undefined => {
	let sharedData = mp.players.local.getVariable(_sharedAccountDataIdentifier);
	if (!sharedData) return;

	return sharedData as UserData;
}


export default getUserData;
