import { ClothingData, ClothingStore, UserData } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids, _sharedAccountDataIdentifier, _sharedClothingDataIdentifier } from "@/Constants/Constants";
import DeathSystem from "@/DeathSystem/DeathSystem";
import getClothingData from "@/PlayerMethods/getClothingData";
import getTargetData from "@/PlayerMethods/getTargetData";
import { Browsers } from "@/enums";

class Clothing {
    public static LocalPlayer: PlayerMp;
    public static _clothingStoreIdentifier: string = "clothingStoreData";

    constructor() {
        Clothing.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", Clothing.handleStreamIn);
        mp.events.add("render", Clothing.handleRender);
        mp.events.add("clothes:setClothingData", Clothing.setClothingData);
        mp.events.add("clothes:setRot", Clothing.handleRotation);
        mp.events.add("playerExitColshape", Clothing.exitColHandle);

        mp.keys.bind(_control_ids.Y, false, Clothing.handleKeyPressed_Y);

        mp.events.addDataHandler(_sharedClothingDataIdentifier, Clothing.handleStreamIn);
        mp.events.addDataHandler(_sharedAccountDataIdentifier, Clothing.handleDataHandlerAccount);
    }

    public static handleRender() {
        if(BrowserSystem.LocalPlayer.browserRouter == Browsers.Clothing) {
            DeathSystem.disableControls();
            mp.gui.cursor.show(true, true);
        }
    }

    public static exitColHandle(colshape: ColshapeMp) {
        if(colshape.getVariable(Clothing._clothingStoreIdentifier) && BrowserSystem.LocalPlayer.browserRouter == Browsers.Clothing) {
            BrowserSystem.pushRouter("/", false);
        }
    }

    public static handleRotation(rot: string) {
        Clothing.LocalPlayer.setHeading(parseInt(rot));
    }

    public static handleKeyPressed_Y() {
        if(!Clothing.LocalPlayer.isTypingInTextChat) {
            let currentClothingStoreData: ClothingStore | undefined = Clothing.LocalPlayer.getVariable(Clothing._clothingStoreIdentifier);
            let playerClothingData: ClothingData | undefined = getClothingData(Clothing.LocalPlayer);

            if(currentClothingStoreData && playerClothingData) {
                if(BrowserSystem._browserInstance) {

                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                        _mutationKey: "clothing_data",
                        data: ${JSON.stringify(playerClothingData)}
                    })`);

                    BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                        _mutationKey: "clothing_data_old",
                        data: ${JSON.stringify(playerClothingData)}
                    })`);

                }
                BrowserSystem.pushRouter(Browsers.Clothing);
            }
        }
    }

    public static handleDataHandlerAccount(entity: PlayerMp, user: UserData) {
        if(entity.type == "player" && getClothingData(entity) && !user?.adminDuty) {
            Clothing.setClothingData(getClothingData(entity), false, true, entity);
        }
    }

    public static handleDataHandler(entity: PlayerMp, clothingData: ClothingData) {
        if(entity.type == "player" && clothingData) {
            let userData: UserData | undefined = getTargetData(entity);

            if(userData && !userData.showAdminPed) {
                Clothing.setClothingData(clothingData, false, true, entity);
            }
        }
    }

    public static handleStreamIn(entity: PlayerMp) {
        if(entity.type == "player" || entity.type == "ped") {
            let clothingData: ClothingData | undefined = getClothingData(entity);
            let userData: UserData | undefined = getTargetData(entity);

            if(!clothingData || !userData) return;

            if(!userData.showAdminPed) {
                Clothing.setClothingData(clothingData, false, true, entity);
            }
        }
    }

    public static async setClothingData(clothingData: any, parse: boolean, timeout: boolean = true, entity: PlayerMp | PedMp = Clothing.LocalPlayer) {
        if(!clothingData) return;
        if(parse) {
            clothingData = JSON.parse(clothingData as string);
        }

        timeout ? await mp.game.waitAsync(300) : null;

        if(!entity || !clothingData) return;

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