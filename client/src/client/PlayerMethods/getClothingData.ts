import { ClothingData } from "@/@types";
import { _sharedClothingDataIdentifier } from "@/Constants/Constants";

const getClothingData = (entity: PlayerMp | PedMp): ClothingData | undefined => {
    return entity.getVariable(_sharedClothingDataIdentifier);
}

export default getClothingData;