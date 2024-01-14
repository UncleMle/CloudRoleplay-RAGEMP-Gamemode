import calcDist from "./calcDist";

const getClosestVehicleInRange = (range: number): VehicleMp | undefined | null => {
	if (mp.gui.cursor.visible) return;
	let closestVehicle = null;
	let closestDistance = range + 1;
	const position = mp.players.local.position;
	mp.vehicles.forEachInRange(position, range, (vehicle) => {
		const distToPlayer = calcDist(position, vehicle.position);
		if (distToPlayer < closestDistance) {
			closestVehicle = vehicle;
			closestDistance = distToPlayer;
		}
	});
	return closestVehicle;
}

export default getClosestVehicleInRange;
