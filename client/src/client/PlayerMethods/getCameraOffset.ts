const getCameraOffset = (pos: Vector3, angle: number, dist: number) => {
	angle = angle * 0.0174533;
	pos.y = pos.y + dist * Math.sin(angle);
	pos.x = pos.x + dist * Math.cos(angle);
	return pos;
}

export default getCameraOffset;
