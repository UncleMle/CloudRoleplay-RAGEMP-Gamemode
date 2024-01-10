import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";
import VehicleSpeedo from "@/VehicleSystems/VehicleSpeedo";
import VehicleSystems from "@/VehicleSystems/VehicleSystem";

export default class PlayerDealership {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly _playerVehicleDealerDataIdentifier: string = "playerVehicleDealershipData";

    constructor() {
        mp.events.add({
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
                    if(VehicleSpeedo.getVehDispName(veh.model) !== "NULL") {
                        mp.game.graphics.drawText(`~y~${VehicleSpeedo.getVehDispName(veh.model)}`, [drawCoordsChassis.x, drawCoordsChassis.y - 0.02], {
                            font: 4,
                            color: [255, 255, 255, 255],
                            scale: [0.3, 0.3],
                            outline: false
                        });
                    }
                    
                    mp.game.graphics.drawText(`Being sold for ~g~$${vehicleData.dealership_price.toLocaleString('en-US')}`, [drawCoordsChassis.x, drawCoordsChassis.y], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.3, 0.3],
                        outline: false
                    });

                    mp.game.graphics.drawText(`"${vehicleData.dealership_description}"`, [drawCoordsChassis.x, drawCoordsChassis.y + 0.02], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.2, 0.2],
                        outline: false
                    });
                }
            }
        });
    }

    private static async handleDataHandler(vehicle: VehicleMp, value: boolean) {
        if (vehicle.type === "vehicle" && value !== undefined) {
            if(!value) {
                vehicle.freezePosition(false);
                return;
            }

            await mp.game.waitAsync(2500);

            if (mp.vehicles.at(vehicle.remoteId)) {
                vehicle.freezePosition(value);
            }
        }
    }

    private static async handleEntityStreamIn(vehicle: EntityMp) {
        if (vehicle.type === "vehicle") {
            await mp.game.waitAsync(2500);

            if (vehicle && mp.vehicles.at(vehicle.remoteId)) {

                let vehicleData: VehicleData | undefined = getVehicleData(vehicle as VehicleMp);

                if (vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
                    vehicle.freezePosition(true);
                }
            }
        }
    }
}