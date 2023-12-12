import { _SHARED_VEHICLE_DATA } from 'Constants/Constants';
import { VehicleData } from '../@types';

const getVehicleData = (vehicle: VehicleMp): VehicleData | undefined => {
	if(!vehicle) return;
	let vehicleData: VehicleData | undefined = vehicle.getVariable(_SHARED_VEHICLE_DATA);
	return vehicleData;
}

export default getVehicleData;
