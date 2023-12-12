import { ClothingData, ClothingStore } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids, _sharedAccountDataIdentifier, _sharedClothingDataIdentifier } from "@/Constants/Constants";
import getClothingData from "@/PlayerMethods/getClothingData";
import { Browsers } from "@/enums";

class Clothing {
    public static LocalPlayer: PlayerMp;
    public static _clothingStoreIdentifier: string = "clothingStoreData";

    constructor() {
        Clothing.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", Clothing.handleStreamIn);
        mp.events.add("clothes:setClothingData", Clothing.setClothingData);
        mp.events.add("clothes:setRot", Clothing.handleRotation);
        mp.events.add("playerExitColshape", Clothing.exitColHandle);

        mp.keys.bind(_control_ids.Y, false, Clothing.handleYPressed);

        mp.events.addDataHandler(_sharedClothingDataIdentifier, Clothing.handleStreamIn);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, Clothing.handleDataHandlerAccount);
    }

    public static exitColHandle(colshape: ColshapeMp) {
        if(colshape.getVariable(Clothing._clothingStoreIdentifier) && BrowserSystem.LocalPlayer.browserRouter == Browsers.Clothing) {
            BrowserSystem.pushRouter("/", false);
        }
    }

    public static handleRotation(rot: string) {
        Clothing.LocalPlayer.setHeading(parseInt(rot));
    }

    public static handleYPressed() {
        if(!Clothing.LocalPlayer.isTypingInTextChat) {
            let currentClothingStoreData: ClothingStore | undefined = Clothing.LocalPlayer.getVariable(Clothing._clothingStoreIdentifier);
            let playerClothingData: ClothingData | undefined = getClothingData(Clothing.LocalPlayer);

            if(currentClothingStoreData && playerClothingData) {
                if(BrowserSystem._browserInstance) {
                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                        _mutationKey: "clothing_data",
                        data: ${JSON.stringify(playerClothingData)}
                    })`);

                }
                BrowserSystem.pushRouter(Browsers.Clothing);
            }
        }
    }

    public static handleDataHandlerAccount(entity: PlayerMp) {
        if(entity.type == "player" && getClothingData(entity)) {
            Clothing.setClothingData(getClothingData(entity) as ClothingData, false, entity);
        }
    }

    public static handleDataHandler(entity: PlayerMp, clothingData: ClothingData) {
        if(entity.type == "player" && clothingData) {
            Clothing.setClothingData(clothingData, false, entity);
        }
    }

    public static handleStreamIn(entity: PlayerMp) {
        if(entity.type == "player" || entity.type == "ped") {
            let clothingData: ClothingData | undefined = getClothingData(entity);

            if(!clothingData) return;

            Clothing.setClothingData(clothingData, false, entity);
        }
    }

    public static setClothingData(clothingData: any, parse: boolean, entity: PlayerMp | PedMp = Clothing.LocalPlayer) {
        if(!clothingData) return;
        if(parse) {
            clothingData = JSON.parse(clothingData as string);
        }

        entity.setComponentVariation(1, Number(clothingData.mask), Number(clothingData.mask_texture), 0);
        entity.setComponentVariation(3, Number(clothingData.torso), Number(clothingData.torso_texture), 0);
        entity.setComponentVariation(4, Number(clothingData.leg), Number(clothingData.leg_texture), 0);
        entity.setComponentVariation(5, Number(clothingData.bags), Number(clothingData.bag_texture), 0);
        entity.setComponentVariation(6, Number(clothingData.shoes), Number(clothingData.shoes_texture), 0);
        entity.setComponentVariation(7, Number(clothingData.access), Number(clothingData.access_texture), 0);
        entity.setComponentVariation(8, Number(clothingData.undershirt), Number(clothingData.undershirt_texture), 0);
        entity.setComponentVariation(9, Number(clothingData.armor), Number(clothingData.armor_texture), 0);
        entity.setComponentVariation(10, Number(clothingData.decals), Number(clothingData.decals_texture), 0);
        entity.setComponentVariation(11, Number(clothingData.top), Number(clothingData.top_texture), 0);
    }
}

export default Clothing;