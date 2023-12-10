import { ClothingData } from "@/@types";
import { _sharedAccountDataIdentifier, _sharedClothingDataIdentifier } from "@/Constants/Constants";
import getClothingData from "@/PlayerMethods/getClothingData";

class Clothing {
    constructor() {
        mp.events.add("entityStreamIn", Clothing.handleStreamIn);
        mp.events.addDataHandler(_sharedClothingDataIdentifier, Clothing.handleStreamIn);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, Clothing.handleDataHandlerAccount);
    }

    public static handleDataHandlerAccount(entity: PlayerMp) {
        if(entity.type == "player" && getClothingData(entity)) {
            Clothing.setClothingData(entity, getClothingData(entity) as ClothingData);
        }
    }

    public static handleDataHandler(entity: PlayerMp, clothingData: ClothingData) {
        mp.console.logInfo("Triggered " + JSON.stringify(clothingData));
        if(entity.type == "player" && clothingData) {
            Clothing.setClothingData(entity, clothingData);
        }
    }

    public static handleStreamIn(entity: PlayerMp) {
        mp.console.logInfo("Triggered stream" + JSON.stringify(entity.getVariable(_sharedClothingDataIdentifier)));
        if(entity.type == "player" || entity.type == "ped") {
            let clothingData: ClothingData | undefined = getClothingData(entity);

            mp.console.logInfo("Clothing data from method " + JSON.stringify(clothingData));

            if(!clothingData) return;

            Clothing.setClothingData(entity, clothingData);
        }
    }

    public static setClothingData(entity: PlayerMp | PedMp, clothingData: ClothingData) {
        if(!clothingData) return;
        mp.console.logInfo("triggered setting clothing " + JSON.stringify(clothingData));
        entity.setComponentVariation(1, clothingData.mask, clothingData.mask_texture, 0);
        entity.setComponentVariation(3, clothingData.torso, clothingData.torso_texture, 0);
        entity.setComponentVariation(4, clothingData.leg, clothingData.leg_texture, 0);
        entity.setComponentVariation(5, clothingData.bags, clothingData.bag_texture, 0);
        entity.setComponentVariation(6, clothingData.shoes, clothingData.shoes_texture, 0);
        entity.setComponentVariation(7, clothingData.access, clothingData.access_texture, 0);
        entity.setComponentVariation(8, clothingData.undershirt, clothingData.undershirt_texture, 0);
        entity.setComponentVariation(9, clothingData.armor, clothingData.armor_texture, 0);
        entity.setComponentVariation(10, clothingData.decals, clothingData.decals_texture, 0);
        entity.setComponentVariation(11, clothingData.top, clothingData.top_texture, 0);
    }
}

export default Clothing;