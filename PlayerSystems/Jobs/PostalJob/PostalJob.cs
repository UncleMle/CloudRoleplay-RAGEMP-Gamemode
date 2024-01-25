using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;

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

        public PostalJob()
        {
            KeyPressEvents.keyPress_Y += startPostalJob; 

            NAPI.Blip.CreateBlip(837, jobStartPosition, 1f, 62, "Postal OP", 255, 5f, true, 0, 0);
            MarkersAndLabels.setPlaceMarker(jobStartPosition);
            MarkersAndLabels.setTextLabel(jobStartPosition, "Postal OP\n Use ~y~Y~w~ to interact.", 5f);
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
        #endregion

        #region Remote Events
        [RemoteEvent("server:postalJob:selectJob")]
        void selectPostalJob(Player player, int selectedJob)
        {
            if(!FreelanceJobSystem.hasAJob(player, jobId) && player.checkIsWithinCoord(jobStartPosition, 2f))
            {
                if (FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

                Console.WriteLine(selectedJob + " jid");

                player.setFreelanceJobData(new FreeLanceJobData
                {
                    jobId = jobId,
                    jobLevel = -1,
                    jobStartedUnix = CommandUtils.generateUnix(),
                    jobName = jobName
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

            AttachmentSync.AttachmentSync.addAttachmentForPlayer(player, 28422, "prop_cs_package_01", new Vector3(0, -0.18, -0.18), new Vector3(0, 0, 0));
            AnimationSync.AnimSync.playSyncAnimation(player, "anim@heists@box_carry@", "idle", 49);

            player.SendChatMessage("Given package");
        }
        #endregion
    }
}
