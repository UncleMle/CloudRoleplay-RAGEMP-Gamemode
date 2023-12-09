class WeaponSystem {
    constructor() {

        mp.events.add("playerWeaponShot", WeaponSystem.applyWeaponRecoil);
    }

    public static applyWeaponRecoil() {
        // mp.game.cam.shakeGameplayCam('SMALL_EXPLOSION_SHAKE', 0.021);
        // const campos = mp.game.cam.getGameplayCamRot(0);
        // mp.game.cam.setGameplayCamRelativePitch(campos.x + 0.29, campos.y + 0.25);
    }
}

export default WeaponSystem;