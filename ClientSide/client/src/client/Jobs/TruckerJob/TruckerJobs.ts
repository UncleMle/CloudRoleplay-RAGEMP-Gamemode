import { FreeLanceJobData, FreeLanceJobVehicleData } from "@/@types";
import { FREELANCE_JOB_DATA_KEY, FREELANCE_JOB_VEHICLE_DATA_KEY } from "@/Constants/Constants";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { FreelanceJobs } from "@/enums";

export default class TruckerJob {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static progressInterval: ReturnType<typeof setInterval> | undefined;
    public static startTime: number;
    public static targetTime: number;
    public static targetMessage: string;

    constructor() {
        mp.events.add({
            "render": TruckerJob.handleRender,
            "client:truckerJob:addProgressTimer": TruckerJob.handleProgressTimer
        });
    }

    private static handleRender() {
        let playerJobData: FreeLanceJobData = TruckerJob.LocalPlayer.getVariable(FREELANCE_JOB_DATA_KEY);

        if (TruckerJob.progressInterval && TruckerJob.targetMessage && playerJobData?.jobId === FreelanceJobs.TruckerJob) {
            if (!TruckerJob.LocalPlayer.vehicle) return;

            let vehJobData: FreeLanceJobVehicleData = TruckerJob.LocalPlayer.vehicle.getVariable(FREELANCE_JOB_VEHICLE_DATA_KEY);

            if (vehJobData?.characterOwnerId === getUserCharacterData()?.character_id && vehJobData.jobId === FreelanceJobs.TruckerJob) {
                let progress: number = TruckerJob.targetTime / TruckerJob.startTime;
                let renderText: string = `${TruckerJob.targetMessage} ${Math.round(progress * 100)}%`;

                mp.game.graphics.drawText(renderText, [0.5, 0.55], {
                    font: 4,
                    color: [255, 255, 255, 255],
                    scale: [0.65, 0.65],
                    outline: false
                });
            }
        }
    }

    private static clearProgressTimer() {
        if (TruckerJob.progressInterval) {
            clearInterval(TruckerJob.progressInterval);
            TruckerJob.progressInterval = undefined;
        }
    }

    private static handleProgressTimer(message: string, time: number) {
        if (!message || time === undefined) return;

        TruckerJob.clearProgressTimer();

        TruckerJob.startTime = time;
        TruckerJob.targetTime = 0;
        TruckerJob.targetMessage = message;

        TruckerJob.progressInterval = setInterval(() => {
            if (TruckerJob.targetTime >= TruckerJob.startTime) return TruckerJob.clearProgressTimer();

            TruckerJob.targetTime++;
        }, 1000);
    }
}