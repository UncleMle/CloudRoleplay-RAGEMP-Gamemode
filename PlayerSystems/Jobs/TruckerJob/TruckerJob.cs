using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using System;
using System.Linq;
using System.Threading;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerJob : Script
    {
        public static readonly string jobName = "Trucker Job";
        public static readonly Vector3 truckerJobStart = new Vector3(-424.4, -2789.8, 6.5);
        public static readonly Vector3 truckerJobFinishJob = new Vector3(-446.6, -2788.5, 6.0);
        public static readonly string _truckerVehicleDataKey = "truckerJobVehicleDataIdentifier";
        public static readonly string _truckerPlayerJobData = "truckerJobPlayerDataIdentifier";
        public static readonly int truckerLoadTime_seconds = 40;
        public static readonly int truckerUnloadTime_seconds = 25;
        public static readonly int jobId = (int)FreelanceJobs.TruckerJob;
        public static string[] spawnableTrucks = new string[] {
            "packer",
            "hauler",
            "phantom",
            "phantom3"
        };

        #region Init
        public TruckerJob()
        {
            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                menuTitle = "Trucking Job",
                raycastMenuItems = new string[] { "Start trucking job" },
                raycastMenuPosition = truckerJobStart,
                targetMethod = startTruckerJob
            });

            FreelanceJobSystem.quitJob += (player, job) =>
            {
                if(job.jobId == (int)FreelanceJobs.TruckerJob)
                {
                    player.TriggerEvent("client:truckerJob:clearProgress");
                }
            };

            AvailableJobs.availableJobs.ForEach(job =>
            {
                job.jobId = AvailableJobs.availableJobs.IndexOf(job);

                ColShape loadColshape = NAPI.ColShape.CreateSphereColShape(job.loadingPosition, 5f, 0);
                ColShape destinationColShape = NAPI.ColShape.CreateSphereColShape(job.destinationPosition, 5f, 0);
                ColShape endJobColshape = NAPI.ColShape.CreateSphereColShape(truckerJobFinishJob, 5f, 0);

                loadColshape.OnEntityEnterColShape += (col, player) => 
                {
                    if(col.Equals(loadColshape) && player.IsInVehicle)
                    {
                        handleTruckerLoad(player);
                    }
                };

                destinationColShape.OnEntityEnterColShape += (col, player) =>
                {
                    if (col.Equals(destinationColShape) && player.IsInVehicle)
                    {
                        handleTruckerDestination(player);
                    }
                };
                
                endJobColshape.OnEntityEnterColShape += (col, player) =>
                {
                    if (col.Equals(endJobColshape) && player.IsInVehicle)
                    {
                        handleTruckerEndJob(player);
                    }
                };
            });

            NAPI.Blip.CreateBlip(477, truckerJobStart, 1f, 41, "Trucker Job", 255, 1f, true, 0, 0);

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {AvailableJobs.availableJobs.Count} trucker jobs were loaded.");
        }
        #endregion

        #region Global Methods
        private static void startTruckerJob(Player player, string rayOption)
        {
            if (!player.checkIsWithinCoord(truckerJobStart, 2f) || FreelanceJobSystem.hasAJob(player, jobId)) return;

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
                TruckerSpawnPosition spawnPosition = null;

                foreach (TruckerSpawnPosition position in TruckerSpawns.truckerSpawnPositions)
                {
                    if (VehicleSystem.checkVehInSpot(position.position, 6) == null)
                    {
                        spawnPosition = position;
                        break;
                    }
                }

                if (spawnPosition == null)
                {
                    uiHandling.sendPushNotifError(player, "There are no free spots to spawn in your work truck.", 6600);
                    return null;
                }

                int colour = new Random().Next(49, 121);

                spawnedTruck = VehicleSystem.buildVolatileVehicle(player, spawnableTrucks[new Random().Next(0, spawnableTrucks.Length)], spawnPosition.position, spawnPosition.rotation, "TRUCK" + characterData.character_id, colour, colour);

                spawnedTruck.setFreelanceJobData(new FreeLanceJobVehicleData
                {
                    characterOwnerId = characterData.character_id,
                    destroyOnLeave = true,
                    jobId = (int)FreelanceJobs.TruckerJob,
                    jobName = jobName
                });

                MarkersAndLabels.addBlipForClient(player, 477, "Your work truck", spawnPosition.position, 5, 255, 18, false);

                player.SendChatMessage(ChatUtils.freelanceJobs + $"Your work truck has been spawned in and marked on the minimap for. Get in the truck to start the job.");
            }

            return spawnedTruck;
        }

        private static void handleTruckerLoad(Player player)
        {
            if(FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
            {
                FreeLanceJobData freelanceData = player.getFreelanceJobData();
                AvailableJobTrucker selectedJob = player.GetData<AvailableJobTrucker>(_truckerPlayerJobData);

                if (freelanceData.jobLevel == 0 && selectedJob != null)
                {
                    toggleLoadState(player.Vehicle, true);
                    freelanceData.jobLevel = 1;

                    player.setFreelanceJobData(freelanceData);

                    player.SendChatMessage(ChatUtils.freelanceJobs + "Please remain in your truck whilst it is being loaded.");
                    player.TriggerEvent("client:truckerJob:addProgressTimer", "Loading truck", truckerLoadTime_seconds);

                    NAPI.Task.Run(() =>
                    {
                        if(NAPI.Player.IsPlayerConnected(player) && player.getFreelanceJobData()?.jobId == (int)FreelanceJobs.TruckerJob)
                        {
                            if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
                            {
                                toggleLoadState(player.Vehicle, false);
                                MarkersAndLabels.addBlipForClient(player, 1, "Trucker Destination", selectedJob.destinationPosition, 1, 255, -1, true, true);
                                return;
                            }

                            FreelanceJobSystem.deleteFreeLanceVehs(player, true);
                        } 
                    }, truckerLoadTime_seconds * 1000);
                }
            }
        }

        private static void handleTruckerDestination(Player player)
        {
            if(FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
            {
                FreeLanceJobData jobData = player.getFreelanceJobData();
                AvailableJobTrucker selectedJob = player.GetData<AvailableJobTrucker>(_truckerPlayerJobData);

                if (jobData.jobLevel == 1 && selectedJob != null)
                {
                    player.SendChatMessage(ChatUtils.freelanceJobs + "Please remain in your truck whilst it gets unloaded.");
                    jobData.jobLevel = 2;
                    player.setFreelanceJobData(jobData);
                    player.Vehicle.freeze(true);
                    player.TriggerEvent("client:truckerJob:addProgressTimer", "Unloading truck", truckerUnloadTime_seconds);

                    NAPI.Task.Run(() =>
                    {
                        if (NAPI.Player.IsPlayerConnected(player) && FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
                        {
                            player.Vehicle.freeze(false);
                            MarkersAndLabels.addBlipForClient(player, 1, "Trucker Depot", truckerJobFinishJob, 69, 255, -1, true, true);

                            player.SendChatMessage(ChatUtils.freelanceJobs + $"You have finished the trucker job {selectedJob.jobName} to get payed return your truck to the trucker depot.");
                        } else
                        {
                            FreelanceJobSystem.deleteFreeLanceVehs(player, true);
                        }
                    }, truckerUnloadTime_seconds * 1000);
                }
            }
        }

        private static void handleTruckerEndJob(Player player)
        {
            if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
            {
                FreeLanceJobData jobData = player.getFreelanceJobData();
                DbCharacter characterData = player.getPlayerCharacterData();
                AvailableJobTrucker selectedJob = player.GetData<AvailableJobTrucker>(_truckerPlayerJobData);

                if(characterData != null && selectedJob != null && jobData.jobLevel == 2)
                {
                    characterData.salary_amount += selectedJob.jobPay;
                    player.setPlayerCharacterData(characterData, false, true);

                    player.SendChatMessage(ChatUtils.freelanceJobs + $"You have finished the trucker job {selectedJob.jobName} and {ChatUtils.moneyGreen}${selectedJob.jobPay.ToString("N0")}{ChatUtils.White} has been paid into your salary.");
                    FreelanceJobSystem.deleteFreeLanceVehs(player);
                    MarkersAndLabels.removeClientBlip(player);
                }
            }
        }

        private static void toggleLoadState(Vehicle vehicle, bool toggle)
        {
            TruckerJobVehicleData truckerData = vehicle.GetData<TruckerJobVehicleData>(_truckerVehicleDataKey);

            if(truckerData != null)
            {
                truckerData.beingLoaded = toggle;
                vehicle.freeze(toggle);

                vehicle.SetData(_truckerVehicleDataKey, truckerData);
                vehicle.SetSharedData(_truckerVehicleDataKey, truckerData);
            }
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:handleTruckerJobRequest")]
        public void handleTruckerJob(Player player, int truckerJobId)
        {
            if (!player.checkIsWithinCoord(truckerJobStart, 2f)) return;

            if(!FreelanceJobSystem.hasAJob(player, (int)FreelanceJobs.TruckerJob))
            {
                if (FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

                if(!player.hasLicense(Licenses.HeavyGoods))
                {
                    uiHandling.sendPushNotifError(player, "You must have a heavy goods license to start this job.", 5600);
                    return;
                }

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

                player.SetCustomData(_truckerPlayerJobData, selectedJob);

                Vehicle spawnedWorkTruck = spawnWorkTruck(player);

                if (spawnedWorkTruck != null)
                {
                    spawnedWorkTruck.SetData(_truckerVehicleDataKey, new TruckerJobVehicleData
                    {
                        destinationPosition = selectedJob.destinationPosition,
                        loadingPosition = selectedJob.loadingPosition,
                        jobId = selectedJob.jobId,
                    });

                    NAPI.Task.Run(() =>
                    {
                        if (spawnedWorkTruck.Exists)
                        {
                            spawnedWorkTruck.addSyncedTrailer(selectedJob.vehicleTrailer);
                        }
                    }, 1500);
                }

                uiHandling.resetRouter(player);
            }            
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void beginTruckerJob(Player player, Vehicle vehicle, sbyte seatId)
        {
            TruckerJobVehicleData truckData = vehicle.GetData<TruckerJobVehicleData>(_truckerVehicleDataKey);
            FreeLanceJobData playerJobData = player.getFreelanceJobData();

            if(playerJobData != null && playerJobData.jobLevel == -1)
            {
                if (truckData != null && truckData.beingLoaded)
                {
                    vehicle.freeze(true);
                }

                if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob) && truckData != null && playerJobData.jobLevel == -1)
                {
                    playerJobData.jobLevel = 0;
                    player.setFreelanceJobData(playerJobData);

                    Vector3 loadingPosition = truckData.loadingPosition;

                    MarkersAndLabels.addBlipForClient(player, 1, "Truck Loading position", loadingPosition, 1, 255, -1, true, true);

                    player.SendChatMessage(ChatUtils.freelanceJobs + "Head to the loading area to collect load your trailer.");
                }
            }
        } 
        #endregion
    }
}
