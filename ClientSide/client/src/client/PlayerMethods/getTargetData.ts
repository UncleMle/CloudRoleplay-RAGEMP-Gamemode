import { UserData } from "../@types";
import { _sharedAccountDataIdentifier } from "../Constants/Constants";

const getTargetData = (target: PlayerMp): UserData | undefined => {
	let sharedData = target.getVariable(_sharedAccountDataIdentifier);
	if (!sharedData) return;

	return sharedData as UserData;
}


export default getTargetData;
