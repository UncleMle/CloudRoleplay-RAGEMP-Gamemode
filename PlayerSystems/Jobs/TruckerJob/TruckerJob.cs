using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerJob : Script
    {
        public static readonly string jobName = "Trucker Job";
        public static readonly Vector3 truckerJobStart = new Vector3(-424.4, -2789.8, 6.5);
        public static readonly string _truckerVehicleDataKey = "truckerJobVehicleDataIdentifier";
        public static string[] spawnableTrucks = new string[] {
            "packer",
            "hauler",
            "phantom",
            "phantom3",
            "phantom4"
        };

        #region Init
        public TruckerJob()
        {
            AvailableJobs.availableJobs.ForEach(job =>
            {
                job.jobId = AvailableJobs.availableJobs.IndexOf(job);
            });

            NAPI.Blip.CreateBlip(477, truckerJobStart, 1f, 41, "Trucker Job", 255, 1f, true, 0, 0);
            MarkersAndLabels.setPlaceMarker(truckerJobStart);
            MarkersAndLabels.setTextLabel(truckerJobStart, "Use ~y~Y~w~ to view available jobs.", 3f);

            KeyPressEvents.keyPress_Y += (Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured) =>
            {
                if(!isInSwitchNative && !hasPhoneOut && !isTyping && !isInVehicle && !isInjured)
                {
                    if(player.checkIsWithinCoord(truckerJobStart, 2f))
                    {
                        startTruckerJob(player);
                    }
                }
            };
        }
        #endregion

        #region Global Methods
        private static void startTruckerJob(Player player)
        {
            uiHandling.resetMutationPusher(player, MutationKeys.TruckerJobs);

            AvailableJobs.availableJobs.ForEach(job =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.TruckerJobs, job);
            });

            uiHandling.pushRouterToClient(player, Browsers.TruckerViewUI, true);
        }

        private static Vehicle spawnWorkTruck(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            Vehicle spawnedTruck = null;
            
            if(characterData != null)
            {
                KeyValuePair<float, Vector3> spawnPosition = new KeyValuePair<float, Vector3>();

                foreach (KeyValuePair<float, Vector3> position in TruckerSpawns.truckerSpawnPositions)
                {
                    if (VehicleSystem.checkVehInSpot(position.Value, 6) == null)
                    {
                        spawnPosition = position;
                        break;
                    }
                }

                if (spawnPosition.Value == null)
                {
                    uiHandling.sendPushNotifError(player, "There are no free spots to spawn in your work truck.", 6600);
                    return null;
                }

                spawnedTruck = VehicleSystem.buildVolatileVehicle(player, spawnableTrucks[new Random().Next(0, spawnableTrucks.Length)], spawnPosition.Value, spawnPosition.Key, "TRUCK" + characterData.character_id);

                spawnedTruck.setFreelanceJobData(new FreeLanceJobVehicleData
                {
                    characterOwnerId = characterData.character_id,
                    destroyOnLeave = true,
                    jobId = (int)FreelanceJobs.TruckerJob,
                    jobName = jobName
                });

                MarkersAndLabels.addBlipForClient(player, 477, "You work truck", spawnPosition.Value, 5, 255, 18);

                player.SendChatMessage(ChatUtils.freelanceJobs + $"You work truck has been spawned in and marked on the minimap for. Get in the truck to start the job.");
            }

            return spawnedTruck;
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:handleTruckerJobRequest")]
        public void handleTruckerJob(Player player, int truckerJobId)
        {
            if (!player.checkIsWithinCoord(truckerJobStart, 2f)) return;

            if(!FreelanceJobSystem.hasAJob(player, (int)FreelanceJobs.TruckerJob))
            {
                if(FreelanceJobSystem.hasFreeLanceVehicle(player))
                {
                    CommandUtils.errorSay(player, "You already have a work truck. Continue with your job or use /qjob.");
                } else
                {
                    AvailableJobTrucker selectedJob = AvailableJobs.availableJobs
                        .Where(job => job.jobId == truckerJobId)
                        .FirstOrDefault();

                    player.setFreelanceJobData(new FreeLanceJobData
                    {
                        jobId = (int)FreelanceJobs.TruckerJob,
                        jobLevel = -1,
                        jobName = jobName,
                        jobStartedUnix = CommandUtils.generateUnix()
                    });

                    spawnWorkTruck(player)?.SetData(_truckerVehicleDataKey, new TruckerJobVehicleData
                    {
                        destinationPosition = selectedJob.destinationPosition,
                        loadingPosition = selectedJob.loadingPosition,
                        jobId = selectedJob.jobId,
                    });
                }

                uiHandling.resetRouter(player);
            }            
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void beginTruckerJob(Player player, Vehicle vehicle, sbyte seatId)
        {
            TruckerJobVehicleData vehicleData = vehicle.GetData<TruckerJobVehicleData>(_truckerVehicleDataKey);

            if (vehicle.getFreelanceJobData()?.jobId == (int)FreelanceJobs.TruckerJob)
            {
                Vector3 loadingPosition = vehicleData.loadingPosition;

                MarkersAndLabels.addBlipForClient(player, 1, "Truck Loading position", loadingPosition, 1, 255, -1, true);
            }
        } 
        #endregion

    }
}
