const calcDist = (v1: Vector3, v2: Vector3) => {
	return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
};

export default calcDist;
