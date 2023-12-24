import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class InventorySystem {
    public static LocalPlayer: PlayerMp;

    constructor() {
        InventorySystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.I, false, InventorySystem.toggleInventory);
    }

    public static toggleInventory() {
        if(validateKeyPress(false, true, true)) {
            InventorySystem.LocalPlayer.inventoryStatus = !InventorySystem.LocalPlayer.inventoryStatus;

            BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
                _stateKey: "inventory",
                status: ${InventorySystem.LocalPlayer.inventoryStatus}
            })`);
        }
    }
}

export default InventorySystem;