import { DealerShip } from "@/@types";
import { _control_ids } from "@/Constants/Constants";

class VehicleDealerShips {
    public static LocalPlayer: PlayerMp;
    public static _dealershipIdentifer: string = "vehicleDealership";

    constructor() {
        VehicleDealerShips.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, VehicleDealerShips.handleKeyPress);
    }

    public static handleKeyPress() {
        let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

        if(dealerData) {
            mp.gui.chat.push("Pressed " + JSON.stringify(dealerData));
        }
    }
}

export default VehicleDealerShips;