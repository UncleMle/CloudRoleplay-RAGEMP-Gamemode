const getVehName = (name: number) => {
	var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(name));
	if (vehicleName == null || vehicleName == undefined || vehicleName == 'NULL') { vehicleName = `vehicle` }
	return vehicleName;
}

export default getVehName;
