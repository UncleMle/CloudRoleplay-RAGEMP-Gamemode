const CLEAR_FOCUS = "0x31B73D1EA9F01DA2";

class Camera {
	static Current_Cam: any;
	public identifier: string;
	public position: Vector3;
	public pointAtCoord: Vector3;
	public camera: CameraMp | null | undefined;
	public isMoving: boolean;
	public range: number;
	public speed: number;

    constructor(identifier: any, position: any, pointAtCoord: any) {
        this.identifier = identifier;
        this.position = position;
        this.pointAtCoord = pointAtCoord;
        this.isMoving = false;
        this.range = 10;
        this.speed = 1.1;
        this.create();
		Camera.Current_Cam = this;

		mp.events.add("render", Camera.handleCameraMovement);
    }

	public static handleCameraMovement() {
		if (Camera.Current_Cam === null || !Camera.Current_Cam.isMoving) return;
		let position = Camera.Current_Cam.camera.getCoord();

		Camera.Current_Cam.camera.setCoord(position.x + Camera.Current_Cam.speed, position.y, position.z);

		if (position.x + Camera.Current_Cam.speed >= Camera.Current_Cam.position.x + (Camera.Current_Cam.range / 2)
			|| position.x + Camera.Current_Cam.speed <= Camera.Current_Cam.position.x - (Camera.Current_Cam.range / 2)) {

			Camera.Current_Cam.speed *= -1;
		}
	}

    create() {
        if(Camera.Current_Cam !== null && this.camera && mp.cameras.exists(this.camera)) {
            this.delete();
        }
        this.camera = mp.cameras.new(this.identifier, this.position, new mp.Vector3(0, 0, 0), 40);
        this.camera.pointAtCoord(this.pointAtCoord.x, this.pointAtCoord.y, this.pointAtCoord.z);
        this.camera.setMotionBlurStrength(1000);
        this.setActive();
    }

    setActive() {
        this.camera?.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, false, false);
        mp.game.streaming.setFocusArea(this.position.x, this.position.y, this.position.z, 0, 0, 0);
    }

    startMoving(range: number) {
        this.isMoving = true;
        this.range = range;
    }

    stopMoving() {
        this.isMoving = false;
        this.range = 0.0;
    }

	delete() {
		this.camera?.destroy();
		mp.game.cam.renderScriptCams(false, false, 0, false, false);
		mp.game.invoke(CLEAR_FOCUS);
		Camera.Current_Cam = null;
    }
}

export default Camera;
