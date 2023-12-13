import { DealerShip } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import DeathSystem from "@/DeathSystem/DeathSystem";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

class VehicleDealerShips {
    public static LocalPlayer: PlayerMp;
    public static _dealershipIdentifer: string = "vehicleDealership";
    public static _viewDealerEvent: string = "server:viewDealerVehicles";

    constructor() {
        VehicleDealerShips.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, VehicleDealerShips.handleKeyPress);
        mp.events.add("dealers:initDealership", VehicleDealerShips.initDealership);
        mp.events.add("render", VehicleDealerShips.handleRender);
    }

    public static handleRender() {
        if(VehicleDealerShips.LocalPlayer.browserRouter == Browsers.Dealership) {
            DeathSystem.disableControls();
        }
    }

    public static handleKeyPress() {
        if(!validateKeyPress(true)) return;

        let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

        if(dealerData) {
            mp.events.callRemote(VehicleDealerShips._viewDealerEvent);
        }
    }

    public static initDealership() {
        let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

        if(dealerData) {
            BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
                _mutationKey: "vehicle_dealer_data",
                data: ${JSON.stringify(dealerData)}
            })`);
        }
    }
}

export default VehicleDealerShips;