import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class PlayerDealership {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly _playerVehicleDealerDataIdentifier: string = "playerVehicleDealershipData";

    constructor() {
        mp.events.add({
            "playerEnterVehicle": PlayerDealership.handleVehEnter,
            "entityStreamIn": PlayerDealership.handleEntityStreamIn,
            "render": PlayerDealership.handleRender
        });

        mp.events.addDataHandler(PlayerDealership._playerVehicleDealerDataIdentifier, PlayerDealership.handleDataHandler);
    }

    private static handleRender() {
        mp.vehicles.forEachInStreamRange(veh => {
            let vehicleData: VehicleData | undefined = getVehicleData(veh);

            if (vehicleData && vehicleData.dealership_id != -1) {
                let drawCoordsChassis: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(veh.position.x, veh.position.y, veh.position.z));
                let playerPos: Vector3 = PlayerDealership.LocalPlayer.position;

                const distance: number = new mp.Vector3(playerPos.x, playerPos.y, playerPos.z)
                    .subtract(new mp.Vector3(veh.position.x, veh.position.y, veh.position.z))
                    .length();

                if (drawCoordsChassis && distance < 10) {
                    mp.game.graphics.drawText(`Being sold for ~g~$${vehicleData.dealership_price.toLocaleString('en-US')}`, [drawCoordsChassis.x, drawCoordsChassis.y], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.4, 0.4],
                        outline: false
                    });
                }
            }
        });
    }

    private static handleDataHandler(vehicle: VehicleMp, value: boolean) {
        if (vehicle.type === "vehicle" && !value) {
            vehicle.freezePosition(false);
        }
    }

    private static handleVehEnter(vehicle: VehicleMp) {
        let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

        if (vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
            vehicle.freezePosition(true);

            mp.gui.chat.push("Frozen");
        }
    }

    private static handleEntityStreamIn(vehicle: EntityMp) {
        if (vehicle.type === "vehicle") {
            let vehicleData: VehicleData | undefined = getVehicleData(vehicle as VehicleMp);

            if (vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
                vehicle.freezePosition(true);
            }
        }
    }
}