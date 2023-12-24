import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class InventorySystem {
    public static LocalPlayer: PlayerMp;
    public static _inventoryResyncEvent: string = "server:inventory:resyncItems";

    constructor() {
        InventorySystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.I, false, InventorySystem.toggleInventory);
    }

    public static toggleInventory() {
        if(validateKeyPress(false, true, true) && getUserCharacterData()) {
            InventorySystem.LocalPlayer.inventoryStatus = !InventorySystem.LocalPlayer.inventoryStatus;

            mp.events.callRemote(InventorySystem._inventoryResyncEvent);

            BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
                _stateKey: "inventory",
                status: ${InventorySystem.LocalPlayer.inventoryStatus}
            })`);
        }
    }
}

export default InventorySystem;