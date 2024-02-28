using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.GruppeSixJob
{
    public class GruppeSixJob : Script
    {
        private static readonly Vector3 jobStartPosition = new Vector3(-195.4, -835.3, 30.7);
        private static readonly Vector3 vehicleSpawn = new Vector3(-163.0, -793.6, 31.8);
        private static float spawnRotation = 158.3f;
        private static int jobId = (int)FreelanceJobs.GruppeSix;
        private static readonly string jobName = "Gruppe Six";
        private static readonly string spawnVehicleName = "stockade";
        private static readonly string _gruppeSixJobDataKey = "server:jobs:gruppeSixJobDataKey";

        public GruppeSixJob()
        {
            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                menuTitle = "Gruppe Six Job",
                raycastMenuItems = new List<string> { "Start gruppe six job" },
                raycastMenuPosition = jobStartPosition,
                targetMethod = startGruppeSixJob
            });
            
            NAPI.Blip.CreateBlip(67, jobStartPosition, 1f, 2, jobName, 255, 5f, true, 0, 0);

            ColShape endCol = NAPI.ColShape.CreateSphereColShape(vehicleSpawn, 2f, 0);

            endCol.OnEntityEnterColShape += (col, player) =>
            {
                FreeLanceJobData playerJobData = player.getFreelanceJobData();
                GruppeSixJobData selectJob = player.GetData<GruppeSixJobData>(_gruppeSixJobDataKey);

                if (!col.Equals(endCol) || playerJobData == null || selectJob == null) return;

                if(playerJobData.jobFinished && playerJobData.jobId == jobId)
                {
                    handleJobPay(player, playerJobData, selectJob.selectJob);
                }

            };

            AvailableJobs.gruppeSixJobs.ForEach(job =>
            {
                job.deliveryStops.ForEach(stop =>
                {
                    initAtm(stop);
                });
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"Gruppe six job has loaded.");
        }

        #region Global Methods
        private static void startGruppeSixJob(Player player, string rayOption)
        {
            if (!player.checkIsWithinCoord(jobStartPosition, 2f) || FreelanceJobSystem.hasAJob(player, jobId)) return;
            uiHandling.resetMutationPusher(player, MutationKeys.GruppeSixJobs);

            AvailableJobs.gruppeSixJobs.ForEach(job =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.GruppeSixJobs, job);
            });

            uiHandling.pushRouterToClient(player, Browsers.GruppeSixJobView, true);
        }

        private static void createGruppeSixTruck(Player player)
        {
            if(!FreelanceJobSystem.hasFreeLanceVehicle(player))
            {
                DbCharacter character = player.getPlayerCharacterData();

                Vehicle workVehicle = VehicleSystem.buildVolatileVehicle(player, spawnVehicleName, vehicleSpawn, spawnRotation, "G6" + character.character_id, 1, 1);

                if (workVehicle == null) return;

                workVehicle.setFreelanceJobData(new FreeLanceJobVehicleData
                {
                    characterOwnerId = character.character_id,
                    destroyOnLeave = true,
                    jobId = jobId,
                    jobName = jobName
                });

                MarkersAndLabels.addBlipForClient(player, 67, "Work Truck", vehicleSpawn, 50, 255, 20);

                player.SendChatMessage(ChatUtils.freelanceJobs + $"Enter your work truck marked on the map.");
            }
        }

        private static void initAtm(Vector3 stop)
        {
            ColShape stopCol = NAPI.ColShape.CreateSphereColShape(stop, 2f, 0);

            stopCol.OnEntityEnterColShape += (col, player) =>
            {
                FreeLanceJobData jobData = player.getFreelanceJobData();
                GruppeSixJobData selectedJob = player.GetData<GruppeSixJobData>(_gruppeSixJobDataKey);
                if (!col.Equals(stopCol) || selectedJob == null || jobData == null || jobData.jobId != jobId || jobData.jobLevel < 0 || jobData.jobFinished) return;

                Vector3 currentStop = selectedJob.selectJob.deliveryStops[jobData.jobLevel];
                int selectIndex = selectedJob.selectJob.deliveryStops.IndexOf(currentStop);

                if ((selectIndex != selectedJob.selectJob.deliveryStops.IndexOf(stop))) return; 

                if (!selectedJob.carryingMoney)
                {
                    uiHandling.sendPushNotifError(player, "You don't have any money to refill the ATM grab some from the truck.", 6700);
                    return;
                }

                uiHandling.sendNotification(player, "~g~Refilled ATM", false, true, "Refills Atm...");

                selectedJob.carryingMoney = false;
                player.SetData(_gruppeSixJobDataKey, selectedJob);

                if (jobData.jobLevel >= selectedJob.selectJob.deliveryStops.Count - 1)
                {
                    handleJobEnd(player, jobData, selectedJob.selectJob.name);
                    return;
                }

                jobData.jobLevel++;

                player.setFreelanceJobData(jobData);

                Vector3 nextStop = selectedJob.selectJob.deliveryStops[jobData.jobLevel];
                
                MarkersAndLabels.addBlipForClient(player, 1, "Next ATM", nextStop, 41, 255, -1, true, true);
            };

        }

        private static void handleJobEnd(Player player, FreeLanceJobData job, string selectJobName)
        {
            job.jobFinished = true;

            player.setFreelanceJobData(job);

            player.SendChatMessage(ChatUtils.freelanceJobs + $"You have finished the {jobName} job ({selectJobName}) head back to the Gruppe Six offices to get payed.");

            MarkersAndLabels.addBlipForClient(player, 1, "Finish Job", vehicleSpawn, 1, 255, -1, true, true);
        }

        private static void handleJobPay(Player player, FreeLanceJobData job, GruppeSixAvailableJob selectJob)
        {
            DbCharacter character = player.getPlayerCharacterData();
            if(character == null || !job.jobFinished || job.jobId != jobId) return;   

            player.ResetData(_gruppeSixJobDataKey);
            MarkersAndLabels.removeClientBlip(player);
            FreelanceJobSystem.deleteFreeLanceVehs(player);

            character.salary_amount += selectJob.jobPay;

            player.setPlayerCharacterData(character, false, true);

            player.SendChatMessage(ChatUtils.freelanceJobs + $"You have finished the {jobName} Job ({selectJob.name}) and {ChatUtils.moneyGreen}${selectJob.jobPay.ToString("N0")}{ChatUtils.White} has been paid into your salary.");
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:jobs:gruppeSixStart")]
        public void selectGruppeSixJob(Player player, int selectedJobId)
        {
            if (!player.checkIsWithinCoord(jobStartPosition, 2f) || FreelanceJobSystem.hasAJob(player, jobId)) return;

            GruppeSixAvailableJob job = AvailableJobs.gruppeSixJobs
                .Where(job => job.jobId == selectedJobId).FirstOrDefault();

            if(job == null) return;

            player.setFreelanceJobData(new FreeLanceJobData
            {
                jobId = jobId,
                jobName = jobName,
                jobLevel = -1,
                jobStartedUnix = CommandUtils.generateUnix()
            });

            player.SetCustomData(_gruppeSixJobDataKey, new GruppeSixJobData {
                carryingMoney = false,
                selectJob = job,
            });

            createGruppeSixTruck(player);

            uiHandling.resetRouter(player);
        }

        [RemoteEvent("server:jobs:gruppeSix:takeMoney")]
        public void takeGruppeSixMoney(Player player, Vehicle vehicle)
        {
            if (Vector3.Distance(player.Position, vehicle.Position) > 12) return;

            DbCharacter character = player.getPlayerCharacterData();

            if(vehicle.getFreelanceJobData()?.jobId == jobId && vehicle.getFreelanceJobData()?.characterOwnerId == character?.character_id)
            {
                GruppeSixJobData jobData = player.GetData<GruppeSixJobData>(_gruppeSixJobDataKey);
                if (jobData == null) return;

                if (jobData.carryingMoney) return;

                jobData.carryingMoney = true;
                player.SetData(_gruppeSixJobDataKey, jobData);

                uiHandling.sendNotification(player, "~g~Grabbed cash", false, true, "Grabs cash...");

                AttachmentSync.AttachmentSync.addAttachmentForPlayer(player, 6286, "hei_prop_heist_binbag", new Vector3(0, -0.18, -0.18), new Vector3(0, 0, 0));
            }            
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void playerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            FreeLanceJobData jobData = player.getFreelanceJobData();
            GruppeSixJobData gruppeSix = player.GetData<GruppeSixJobData>(_gruppeSixJobDataKey);
            if(jobData == null || gruppeSix == null) return;

            if(jobData.jobLevel == -1 && FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.GruppeSix)) {
                Vector3 firstStop = gruppeSix.selectJob.deliveryStops.First();
                if (firstStop == null) return;

                jobData.jobLevel = 0;
                player.setFreelanceJobData(jobData);

                MarkersAndLabels.addBlipForClient(player, 1, "First Atm", firstStop, 41, 255, -1, true, true);

                player.SendChatMessage(ChatUtils.freelanceJobs + "Head to the first ATM marked on the GPS.");
            }
        }
        #endregion

    }
}
