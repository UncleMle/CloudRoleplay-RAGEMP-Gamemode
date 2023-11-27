const distBetweenCoords = (x: Vector3, y: Vector3): number => {
	return mp.game.gameplay.getDistanceBetweenCoords(y.x, y.y, y.z, y.x, y.y, y.z, false);
}

export default distBetweenCoords;
