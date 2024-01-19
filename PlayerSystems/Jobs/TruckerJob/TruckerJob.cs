﻿using CloudRP.PlayerSystems.Character;
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

        private static void spawnWorkTruck(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if(characterData != null)
            {
                KeyValuePair<float, Vector3> spawnPosition = new KeyValuePair<float, Vector3>();

                foreach (KeyValuePair<float, Vector3> position in TruckerSpawns.truckerSpawnPositions)
                {
                    if (VehicleSystem.checkVehInSpot(position.Value, 6) != null)
                    {
                        spawnPosition = position;
                        break;
                    }
                }

                if (spawnPosition.Value == null)
                {
                    uiHandling.sendPushNotifError(player, "There are no free spots to spawn in your work truck.", 6600);
                    return;
                }

                Vehicle spawnedTruck = VehicleSystem.buildVolatileVehicle(player, spawnableTrucks[new Random().Next(0, spawnableTrucks.Length)], spawnPosition.Value, spawnPosition.Key, "TRUCK" + characterData.character_id);

                spawnedTruck.setFreelanceJobData(new FreeLanceJobVehicleData
                {
                    characterOwnerId = characterData.character_id,
                    destroyOnLeave = true,
                    jobId = (int)FreelanceJobs.TruckerJob,
                    jobName = jobName
                });
            }
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:handleTruckerJobRequest")]
        private void handleTruckerJob(Player player, int truckerJobId)
        {
            if (!player.checkIsWithinCoord(truckerJobStart, 2f)) return;

            if(!FreelanceJobSystem.hasAJob(player, (int)FreelanceJobs.TruckerJob))
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

                spawnWorkTruck(player);
            }            
        }
        #endregion

    }
}
