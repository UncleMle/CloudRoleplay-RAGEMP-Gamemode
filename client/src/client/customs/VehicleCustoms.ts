import { VehicleData, VehicleMods } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _SHARED_VEHICLE_DATA } from "@/Constants/Constants";
import DeathSystem from "@/DeathSystem/DeathSystem";
import getVehicleData from "@/PlayerMethods/getVehicleData";
import { Browsers } from "@/enums";

class VehicleCustoms {
    public static LocalPlayer: PlayerMp;
    public static _colshapeDataIdentifier: string = "customsAreaColshapeData";

    constructor() {
        VehicleCustoms.LocalPlayer = mp.players.local;

        mp.events.add("playerExitColshape", VehicleCustoms.handleColEnter);
        mp.events.add("vehicle:setAttachments", VehicleCustoms.setVehicleAttachments);
        mp.events.add("entityStreamIn", VehicleCustoms.handleStreamIn);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleCustoms.handleDataHandler);
        mp.events.add("render", VehicleCustoms.handleRender);
    }

    public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
        if(entity.type != "vehicle" || !data) return;

        VehicleCustoms.setVehicleAttachments(data.vehicle_mods, false, entity);
    }

    public static handleStreamIn(entity: VehicleMp) {
        let vehicleData: VehicleData | undefined = getVehicleData(entity);
        if(entity.type != "vehicle" || !vehicleData) return;

        VehicleCustoms.setVehicleAttachments(vehicleData.vehicle_mods, false, entity);
    }

    public static handleRender() {
        if(VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            DeathSystem.disableControls();
        }
    }

    public static handleColEnter(colshape: ColshapeMp) {
        if(colshape.getVariable(VehicleCustoms._colshapeDataIdentifier) && VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            BrowserSystem.pushRouter("/");
        }
    }

    public static setVehicleAttachments(data: any, parse: boolean = false, vehicle: VehicleMp = VehicleCustoms.LocalPlayer.vehicle) {
        if(!data || !vehicle) return;

        let modData: VehicleMods = data;

        if(parse) {
            modData = JSON.parse(data);
        }

        vehicle.setMod(0, Number(modData.spoilers));
        vehicle.setMod(1, Number(modData.front_bumper));
        vehicle.setMod(2, Number(modData.rear_bumper));
        vehicle.setMod(3, Number(modData.side_skirt));
        vehicle.setMod(4, Number(modData.exhaust));
        vehicle.setMod(5, Number(modData.frame));
        vehicle.setMod(6, Number(modData.grille));
        vehicle.setMod(7, Number(modData.hood));
        vehicle.setMod(8, Number(modData.fender));
        vehicle.setMod(9, Number(modData.right_fender));
        vehicle.setMod(10, Number(modData.roof));
        vehicle.setMod(11, Number(modData.engine));
        vehicle.setMod(12, Number(modData.brakes));
        vehicle.setMod(13, Number(modData.transmission));
        vehicle.setMod(14, Number(modData.horns));
        vehicle.setMod(15, Number(modData.suspension));
        vehicle.setMod(16, Number(modData.armor));
        vehicle.setMod(18, Number(modData.turbo));
        vehicle.setMod(22, Number(modData.xenon));
        vehicle.setMod(23, Number(modData.front_wheels));
        vehicle.setMod(24, Number(modData.back_wheels));
        vehicle.setMod(25, Number(modData.plate_holders));
        vehicle.setMod(27, Number(modData.trim_design));
        vehicle.setMod(28, Number(modData.ornaments));
        vehicle.setMod(30, Number(modData.dial_design));
        vehicle.setMod(33, Number(modData.steering_wheel));
        vehicle.setMod(34, Number(modData.shift_lever));
        vehicle.setMod(35, Number(modData.plaques));
        vehicle.setMod(38, Number(modData.hydraulics));
        vehicle.setMod(40, Number(modData.boost));
        vehicle.setMod(55, Number(modData.window_tint));
        vehicle.setMod(48, Number(modData.livery));
        vehicle.setMod(53, Number(modData.plate));
        vehicle.setMod(66, Number(modData.colour_1));
        vehicle.setMod(67, Number(modData.colour_2));

        vehicle.setColours(Number(modData.colour_1), Number(modData.colour_2));

    }
}

export default VehicleCustoms;