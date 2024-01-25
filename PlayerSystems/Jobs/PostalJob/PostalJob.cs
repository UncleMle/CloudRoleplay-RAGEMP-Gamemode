using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
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
            KeyPressEvents.keyPress_Y += startPostalJob; 

            NAPI.Blip.CreateBlip(837, jobStartPosition, 1f, 62, "Postal OP", 255, 5f, true, 0, 0);
            MarkersAndLabels.setPlaceMarker(jobStartPosition);
            MarkersAndLabels.setTextLabel(jobStartPosition, "Postal OP\n Use ~y~Y~w~ to interact.", 5f);

            AvailableJobs.availablePostalJobs.ForEach(postalJob =>
            {
                postalJob.deliveryStops.ForEach(stop =>
                {
                    initDelieveryStop(stop);
                });
            });
        }

        #region Methods
        void spawnPostalJobVehicle(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            Vehicle workTruck = VehicleSystem.buildVolatileVehicle(player, postalTruck, jobVehicleSpawn, jobVehicleRotation, "POST" + characterData.character_id, 44, 44);

            workTruck.setFreelanceJobData(new FreeLanceJobVehicleData
            {
                jobId = jobId,
                jobName = jobName,
                characterOwnerId = characterData.character_id,
            });
        }

        void startPostalJob(Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured)
        {
            if (!player.checkIsWithinCoord(jobStartPosition, 2f) || isInSwitchNative || hasPhoneOut || isPauseMenuActive || isTyping || isInjured) return;

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

                int selectedIdx = AvailableJobs.availablePostalJobs.IndexOf(postalData.selectedJob);


                if(((postalData.selectedJobLevel - selectedIdx) == 1 || postalData.selectedJobLevel == 0 && selectedIdx == 0) && playerJobData.jobId == jobId && playerJobData.jobLevel == 0)
                {
                    if((postalData.selectedJobLevel + 1) > postalData.selectedJob.deliveryStops.Count)
                    {
                        handleJobEnd(player, postalData);
                        return;
                    }

                    postalData.selectedJobLevel++;

                    player.SendChatMessage("Recieved parcel");

                    addDeliverPointMarker(player, postalData.selectedJob.deliveryStops[postalData.selectedJobLevel]);
                }
            };
        }

        void addDeliverPointMarker(Player player, Vector3 nextDelieverPoint)
        {
            MarkersAndLabels.addBlipForClient(player, 1, "Delivery Point", nextDelieverPoint, 17, 255, -1, true, true);
        }

        void handleJobEnd(Player player, PostalJobData jobData)
        {
            player.SendChatMessage("Job end");
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

                spawnPostalJobVehicle(player);
                uiHandling.resetRouter(player);

                MarkersAndLabels.addBlipForClient(player, 616, "Postal truck", jobVehicleSpawn, 67, 255, 20);
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

            AttachmentSync.AttachmentSync.addAttachmentForPlayer(player, 6286, "prop_cs_package_01", new Vector3(0, -0.18, -0.18), new Vector3(0, 0, 0));
            AnimationSync.AnimSync.playSyncAnimation(player, "anim@heists@box_carry@", "idle", 49);

            PostalJobData currentPostalData = player.GetData<PostalJobData>(postalJobDataKey);
            if(currentPostalData == null) return;

            currentPostalData.hasPackage = true;
            player.SetData(postalJobDataKey, currentPostalData);

            player.SendChatMessage("Given package");
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

            if(vehicleFreelanceData.characterOwnerId == characterData.character_id && playerFreelanceData.jobId == jobId && vehicleFreelanceData.jobId == jobId)
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
