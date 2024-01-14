const isFlipped = (vehicle: VehicleMp): boolean => {
	if (Math.trunc(vehicle.getRotation(2).y) > 80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === 1 || Math.trunc(vehicle.getRotation(2).y) < -80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === -1) {
		return true;
	}

	return false;
}

export default isFlipped;
