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
        public static readonly int truckerLoadTime_seconds = 40;
        public static string[] spawnableTrucks = new string[] {
            "packer",
            "hauler",
            "phantom",
            "phantom3"
        };

        #region Init
        public TruckerJob()
        {
            AvailableJobs.availableJobs.ForEach(job =>
            {
                job.jobId = AvailableJobs.availableJobs.IndexOf(job);

                ColShape loadColshape = NAPI.ColShape.CreateSphereColShape(job.loadingPosition, 12f, 0);
                ColShape endJobColshape = NAPI.ColShape.CreateSphereColShape(job.destinationPosition, 12f, 0);

                loadColshape.OnEntityEnterColShape += (col, player) => {
                    if(col.Equals(loadColshape) && player.IsInVehicle)
                    {
                        handleTruckerLoad(player, job);
                    }
                };
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

                MarkersAndLabels.addBlipForClient(player, 477, "You work truck", spawnPosition.position, 5, 255, 18, false);

                player.SendChatMessage(ChatUtils.freelanceJobs + $"You work truck has been spawned in and marked on the minimap for. Get in the truck to start the job.");
            }

            return spawnedTruck;
        }

        private static void handleTruckerLoad(Player player, AvailableJobTrucker job)
        {
            Console.WriteLine("loaded " + FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob));

            if(FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
            {
                FreeLanceJobData freelanceData = player.getFreelanceJobData();

                Console.WriteLine(freelanceData.jobLevel + " id");

                if(freelanceData.jobLevel == -1)
                {
                    toggleLoadState(player.Vehicle, true);
                    freelanceData.jobLevel = 0;

                    player.setFreelanceJobData(freelanceData);

                    player.SendChatMessage(ChatUtils.freelanceJobs + "Please remain in your truck whilst it is being loaded.");

                    NAPI.Task.Run(() =>
                    {
                        if(NAPI.Player.IsPlayerConnected(player) && player.getFreelanceJobData()?.jobId == (int)FreelanceJobs.TruckerJob)
                        {
                            if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob))
                            {
                                toggleLoadState(player.Vehicle, false);
                                MarkersAndLabels.addBlipForClient(player, 1, "Trucker Destination", job.destinationPosition, 1, 255, -1, true, true);
                                return;
                            }

                            FreelanceJobSystem.deleteFreeLanceVehs(player);
                            player.SendChatMessage(ChatUtils.freelanceJobs + "Your truck has been returned to your employer.");
                        } 
                    }, truckerLoadTime_seconds * 1000);
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

                    Vehicle spawnedWorkTruck = spawnWorkTruck(player);

                    if(spawnedWorkTruck != null)
                    {
                        spawnedWorkTruck.SetData(_truckerVehicleDataKey, new TruckerJobVehicleData
                        {
                            destinationPosition = selectedJob.destinationPosition,
                            loadingPosition = selectedJob.loadingPosition,
                            jobId = selectedJob.jobId,
                        });

                        spawnedWorkTruck.addSyncedTrailer(selectedJob.vehicleTrailer);
                    }
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

                if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.TruckerJob) && truckData != null)
                {
                    Vector3 loadingPosition = truckData.loadingPosition;

                    MarkersAndLabels.addBlipForClient(player, 1, "Truck Loading position", loadingPosition, 1, 255, -1, true, true);

                    player.SendChatMessage(ChatUtils.freelanceJobs + "Head to the loading area to collect load your trailer.");
                }
            }
        } 
        #endregion
    }
}
