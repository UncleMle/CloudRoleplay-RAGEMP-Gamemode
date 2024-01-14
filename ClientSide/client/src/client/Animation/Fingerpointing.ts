import { _control_ids } from "@/Constants/Constants";

export default class Fingerpointing {
    public static LocalPlayer: PlayerMp;
    public static active: boolean;
    public static lastSent: number = 0;
    public static interval: undefined | number;
    public static gameplayCam: CameraMp;
    public static lastSync: number = 0;

    constructor() {
        Fingerpointing.LocalPlayer = mp.players.local;
        Fingerpointing.gameplayCam = mp.cameras.new("gameplay");

        mp.events.add("pointing:fpsync.update", Fingerpointing.fpsSync);

        // mp.keys.bind(_control_ids.BBIND, true, Fingerpointing.onKeyPress_B);
        // mp.keys.bind(_control_ids.BBIND, false, Fingerpointing.stop);
    }

    public static onKeyPress_B() {
        Fingerpointing.startPointing();
    }

    public static startPointing() {
        if (!Fingerpointing.active) {
              Fingerpointing.active = true;

              mp.game.streaming.requestAnimDict("anim@mp_point");

              while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                  mp.game.wait(0);
              }

              mp.game.invoke("0x0725a4ccfded9a70", Fingerpointing.LocalPlayer.handle, 0, 1, 1, 1);
              Fingerpointing.LocalPlayer.setConfigFlag(36, true)
              Fingerpointing.LocalPlayer.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
              mp.game.streaming.removeAnimDict("anim@mp_point");

              Fingerpointing.interval = setInterval(Fingerpointing.process.bind(this), 0);
          }
      }

      public static process() {
        if (Fingerpointing.active) {
            mp.game.invoke("0x921ce12c489c4c41", Fingerpointing.LocalPlayer.handle);

            let camPitch = Fingerpointing.getRelativePitch();

            if (camPitch < -70.0) {
                camPitch = -70.0;
            }
            else if (camPitch > 42.0) {
                camPitch = 42.0;
            }
            camPitch = (camPitch + 70.0) / 112.0;

            let camHeading = mp.game.cam.getGameplayCamRelativeHeading();

            let cosCamHeading = mp.game.system.cos(camHeading);
            let sinCamHeading = mp.game.system.sin(camHeading);

            if (camHeading < -180.0) {
                camHeading = -180.0;
            }
            else if (camHeading > 180.0) {
                camHeading = 180.0;
            }
            camHeading = (camHeading + 180.0) / 360.0;

            let coords = Fingerpointing.LocalPlayer.getOffsetFromGivenWorldCoords((cosCamHeading * -0.2) - (sinCamHeading * (0.4 * camHeading + 0.3)), (sinCamHeading * -0.2) + (cosCamHeading * (0.4 * camHeading + 0.3)), 0.6);
            let blocked = (typeof mp.raycasting.testPointToPoint(new mp.Vector3(coords.x, coords.y, coords.z - 0.2), new mp.Vector3(coords.x, coords.y, coords.z + 0.2), Fingerpointing.LocalPlayer.handle, 7) !== 'undefined');

            mp.game.invoke('0xd5bb4025ae449a4e', Fingerpointing.LocalPlayer.handle, "Pitch", camPitch)
            mp.game.invoke('0xd5bb4025ae449a4e', Fingerpointing.LocalPlayer.handle, "Heading", camHeading * -1.0 + 1.0)
            mp.game.invoke('0xb0a6cfd2c69c1088', Fingerpointing.LocalPlayer.handle, "isBlocked", blocked)
            mp.game.invoke('0xb0a6cfd2c69c1088', Fingerpointing.LocalPlayer.handle, "isFirstPerson", mp.game.invoke('0xee778f8c7e1142e2', mp.game.invoke('0x19cafa3c87f7c2ff')) == 4)

            if ((Date.now() - Fingerpointing.lastSent) > 100) {
                Fingerpointing.lastSent = Date.now();
                mp.events.callRemote("fpsync.update", camPitch, camHeading);
            }
        }
    }

    public static stop() {
        if (Fingerpointing.active) {
            clearInterval(Fingerpointing.interval);
            Fingerpointing.interval = undefined;
            Fingerpointing.active = false;

            mp.game.invoke("0xd01015c7316ae176", Fingerpointing.LocalPlayer.handle, "Stop");

            if (!Fingerpointing.LocalPlayer.isInjured()) {
              Fingerpointing.LocalPlayer.clearTasks();
            }
            if (!Fingerpointing.LocalPlayer.isInAnyVehicle(true)) {
                mp.game.invoke("0x0725a4ccfded9a70", Fingerpointing.LocalPlayer.handle, 1, 1, 1, 1);
            }
            Fingerpointing.LocalPlayer.setConfigFlag(36, false);
            Fingerpointing.LocalPlayer.clearTasks();


        }
    }

    public static fpsSync(id: number, camPitch: number, camHeading: number) {
        let netPlayer = Fingerpointing.getPlayerByRemoteId(id);
        if (netPlayer != null) {
            if (netPlayer != mp.players.local) {
                netPlayer.lastReceivedPointing = Date.now();

                if (!netPlayer.pointingInterval) {
                    netPlayer.pointingInterval = setInterval((function () {
                        if (netPlayer && netPlayer.lastReceivedPointing && (Date.now() - netPlayer.lastReceivedPointing) > 1000) {
                            clearInterval(netPlayer.pointingInterval);

                            netPlayer.lastReceivedPointing = undefined;
                            netPlayer.pointingInterval = undefined;

                            mp.game.invoke("0xd01015c7316ae176", netPlayer.handle, "Stop");


                            if (!netPlayer.isInAnyVehicle(true)) {
                                mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 1, 1, 1, 1);
                            }
                            netPlayer.setConfigFlag(36, false);

                        }
                    }).bind(netPlayer), 500);

                    mp.game.streaming.requestAnimDict("anim@mp_point");

                    while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                        mp.game.wait(0);
                    }



                    mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 0, 1, 1, 1);
                    netPlayer.setConfigFlag(36, true)
                    netPlayer.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
                    mp.game.streaming.removeAnimDict("anim@mp_point");
                }

                mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Pitch", camPitch)
                mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Heading", camHeading * -1.0 + 1.0)
                mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isBlocked", 0);
                mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isFirstPerson", 0);
            }
        }
    }

    public static getRelativePitch() {
        let camRot = Fingerpointing.gameplayCam.getRot(2);

        return camRot.x - Fingerpointing.LocalPlayer.getPitch();
    }

    public static getPlayerByRemoteId(remoteId: number) {
        let pla = mp.players.atRemoteId(remoteId);
        if (pla == undefined || pla == null) {
            return null;
        }
        return pla;
    }
}