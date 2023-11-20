import { UserData } from "../@types";
import { _sharedCharacterDataIdentifier } from "../Constants/Constants";

const getUserData = (target: PlayerMp): UserData | undefined => {
	let sharedData = target.getVariable(_sharedCharacterDataIdentifier);
	if (!sharedData) return;

	return sharedData as UserData;
}


export default getUserData;
