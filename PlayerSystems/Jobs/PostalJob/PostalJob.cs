using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Linq;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class PostalJob : Script
    {
        private static readonly Vector3 jobStartPosition = new Vector3(-232.1, -914.9, 32.3);
        private static readonly Vector3 jobVehicleSpawn = new Vector3(-212.6, -920.4, 29.3);
        private static readonly float jobVehicleRotation = -22.0f;
        private static readonly string postalTruck = "boxville2";
        private static readonly int jobId = (int)FreelanceJobs.PostalJob;
        private static readonly string jobName = "Postal Job";
        private static readonly string postalJobDataKey = "postalJobData:key";

        public PostalJob()
        {
            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                raycastMenuItems = new string[] { "Start Postal Job" },
                raycastMenuPosition = jobStartPosition,
                targetMethod = startPostalJob
            });

            NAPI.Blip.CreateBlip(837, jobStartPosition, 1f, 62, "Postal OP", 255, 5f, true, 0, 0);

            ColShape finishJob = NAPI.ColShape.CreateSphereColShape(jobVehicleSpawn, 5f, 0);

            finishJob.OnEntityEnterColShape += (col, player) =>
            {
                if (col.Equals(finishJob))
                {
                    handleJobPay(player);
                }
            };

            AvailableJobs.availablePostalJobs.ForEach(postalJob =>
            {
                postalJob.deliveryStops.ForEach(stop =>
                {
                    initDelieveryStop(stop);
                });
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {AvailableJobs.availablePostalJobs.Count} postal jobs were loaded.");
        }

        #region Methods
        void spawnPostalJobVehicle(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            Vehicle workTruck = VehicleSystem.buildVolatileVehicle(player, postalTruck, jobVehicleSpawn, jobVehicleRotation, "POST" + characterData.character_id, 111, 111);

            workTruck.setFreelanceJobData(new FreeLanceJobVehicleData
            {
                jobId = jobId,
                jobName = jobName,
                characterOwnerId = characterData.character_id
            });
        }

        void startPostalJob(Player player, string rayMenu)
        {
            if (!player.checkIsWithinCoord(jobStartPosition, 2f) || FreelanceJobSystem.hasAJob(player, jobId)) return;

            uiHandling.resetMutationPusher(player, MutationKeys.PostalJobView);

            AvailableJobs.availablePostalJobs.ForEach(postalJob =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.PostalJobView, postalJob);
            });

            uiHandling.pushRouterToClient(player, Browsers.PostalJobView, true);
        }

        void initDelieveryStop(Vector3 stopPos)
        {
            ColShape stopCol = NAPI.ColShape.CreateSphereColShape(stopPos, 2f, 0);

            stopCol.OnEntityEnterColShape += (col, player) =>
            {
                if (!col.Equals(stopCol)) return;
                FreeLanceJobData playerJobData = player.getFreelanceJobData();
                PostalJobData postalData = player.GetData<PostalJobData>(postalJobDataKey);
                
                if(playerJobData == null || postalData == null) return;

                AvailablePostalJob findJob = AvailableJobs.availablePostalJobs
                .Where(job => job.Equals(postalData.selectedJob)).FirstOrDefault();

                int selectedIdx = findJob.deliveryStops.IndexOf(stopPos);

                if((postalData.selectedJobLevel - selectedIdx) == 0 && playerJobData.jobId == jobId && playerJobData.jobLevel == 0)
                {
                    if (!postalData.hasPackage)
                    {
                        uiHandling.sendPushNotifError(player, $"You don't have a package fetch one from the back of the post truck.", 6500);
                        return;
                    }

                    if ((postalData.selectedJobLevel + 1) > postalData.selectedJob.deliveryStops.Count - 1)
                    {
                        handleJobEnd(player, postalData);
                        return;
                    }

                    postalData.selectedJobLevel++;
                    postalData.hasPackage = false;
                    AttachmentSync.AttachmentSync.removePlayerAttachments(player);

                    uiHandling.sendNotification(player, "~g~Delivered parcel.", false, true, "Delivers parcel...");

                    addDeliverPointMarker(player, postalData.selectedJob.deliveryStops[postalData.selectedJobLevel]);
                    player.SetData(postalJobDataKey, postalData);
                }
            };
        }

        void addDeliverPointMarker(Player player, Vector3 nextDelieverPoint)
        {
            MarkersAndLabels.addBlipForClient(player, 1, "Delivery Point", nextDelieverPoint, 17, 255, -1, true, true);
        }

        void handleJobEnd(Player player, PostalJobData jobData)
        {
            FreeLanceJobData freelance = player.getFreelanceJobData();
            if (freelance == null) return;

            freelance.jobLevel = 1;
            freelance.jobFinished = true;
            jobData.selectedJobLevel = jobData.selectedJob.deliveryStops.Count;

            AttachmentSync.AttachmentSync.removePlayerAttachments(player);

            player.SendChatMessage(ChatUtils.freelanceJobs + "Head back to Postal OP to finish your job and get payed.");
            MarkersAndLabels.addBlipForClient(player, 1, "Finish Postal Job", jobVehicleSpawn, 69, 255, -1, true, true);

            player.setFreelanceJobData(freelance);
            player.SetData(postalJobDataKey, jobData);
        }

        void handleJobPay(Player player)
        {
            FreeLanceJobData freelance = player.getFreelanceJobData();
            PostalJobData postal = player.GetData<PostalJobData>(postalJobDataKey);
            DbCharacter characterData = player.getPlayerCharacterData();
            if(postal == null || freelance == null) return;

            if(freelance.jobFinished && freelance.jobId == jobId)
            {
                FreelanceJobSystem.deleteFreeLanceVehs(player);
                MarkersAndLabels.removeClientBlip(player);

                characterData.salary_amount += postal.selectedJob.jobPay;

                player.setPlayerCharacterData(characterData, false, true);
                player.SendChatMessage(ChatUtils.freelanceJobs + $"You have finished your postal route ({postal.selectedJob.name}) and earned {ChatUtils.moneyGreen}${postal.selectedJob.jobPay}");
            }
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:postalJob:selectJob")]
        void selectPostalJob(Player player, int selectedJob)
        {
            if(!FreelanceJobSystem.hasAJob(player, jobId) && player.checkIsWithinCoord(jobStartPosition, 2f))
            {
                if (FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

                AvailablePostalJob job = AvailableJobs.availablePostalJobs
                    .Where(pjob => pjob.jobId == selectedJob)
                    .FirstOrDefault();

                if (job == null) return;

                player.setFreelanceJobData(new FreeLanceJobData
                {
                    jobId = jobId,
                    jobLevel = -1,
                    jobStartedUnix = CommandUtils.generateUnix(),
                    jobName = jobName,
                });

                player.SetData(postalJobDataKey, new PostalJobData
                {
                    selectedJob = job,
                    selectedJobLevel = 0
                });

                if (VehicleSystem.checkVehInSpot(jobVehicleSpawn, 5) != null)
                {
                    CommandUtils.errorSay(player, "There is a vehicle blocking the spawn point.");
                    return;
                }

                spawnPostalJobVehicle(player);
                uiHandling.resetRouter(player);

                MarkersAndLabels.addBlipForClient(player, 616, "Postal truck", jobVehicleSpawn, 67, 255, 20);

                player.SendChatMessage(ChatUtils.freelanceJobs + "Your postal truck has been spawned in get in it and head to your first destination.");
            }
        }

        [RemoteEvent("server:postalJob:pickPackage")]
        void pickupPackage(Player player, Vehicle vehicle)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            FreeLanceJobVehicleData vehicleJobData = vehicle.getFreelanceJobData();

            if (characterData == null || vehicleJobData == null) return;

            if (Vector3.Distance(player.Position, vehicle.Position) > 12 || vehicleJobData.characterOwnerId != characterData.character_id || vehicleJobData.jobId != jobId) return;

            FreeLanceJobData playerJobData = player.getFreelanceJobData();

            if (playerJobData?.jobLevel != 0) return;

            PostalJobData currentPostalData = player.GetData<PostalJobData>(postalJobDataKey);
            if (currentPostalData == null) return;

            if (currentPostalData.hasPackage) return;

            AttachmentSync.AttachmentSync.addAttachmentForPlayer(player, 6286, "prop_cs_package_01", new Vector3(0, -0.18, -0.18), new Vector3(0, 0, 0));
            //AnimationSync.AnimSync.playSyncAnimation(player, "anim@heists@box_carry@", "idle", 49);

            currentPostalData.hasPackage = true;
            player.SetData(postalJobDataKey, currentPostalData);
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void playerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            FreeLanceJobVehicleData vehicleFreelanceData = vehicle.getFreelanceJobData();
            FreeLanceJobData playerFreelanceData = player.getFreelanceJobData();
            DbCharacter characterData = player.getPlayerCharacterData();
            PostalJobData postalJobData = player.GetData<PostalJobData>(postalJobDataKey);
            if(vehicleFreelanceData == null || playerFreelanceData == null || characterData == null || postalJobData == null) return;

            if(playerFreelanceData.jobLevel == -1 && vehicleFreelanceData.characterOwnerId == characterData.character_id && playerFreelanceData.jobId == jobId && vehicleFreelanceData.jobId == jobId)
            {
                playerFreelanceData.jobLevel = 0;

                player.setFreelanceJobData(playerFreelanceData);

                Vector3 startPosition = postalJobData.selectedJob.deliveryStops.First();

                player.SendChatMessage(ChatUtils.freelanceJobs + $"Head to the marker on the GPS and deliver your first package.");

                addDeliverPointMarker(player, startPosition);
            }

        }
        #endregion
    }
}
