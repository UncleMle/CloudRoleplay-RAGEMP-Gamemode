import { Hunger } from "@/@types";
import { _sharedHungerDataIdentifier } from "@/Constants/Constants";

export const getWaterAndHungerData = (player: PlayerMp): Hunger | undefined => {
    return player.getVariable(_sharedHungerDataIdentifier);
}