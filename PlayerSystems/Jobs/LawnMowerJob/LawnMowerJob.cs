﻿using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.LawnMowerJob
{
    public class LawnMowerJob : Script
    {
        public static readonly string mowerSpawnName = "mower";
        public static readonly string _currentMowerJobKey = "server:jobs:lawnMower:currentJob";
        public static readonly int jobId = (int)FreelanceJobs.LawnMower;
        public static readonly string jobName = "Lawn Mower";
        public static List<Vector3> startPositions = new List<Vector3>
        {
            new Vector3(-1353.6, 140.7, 56.3),
            new Vector3(1825.3, 4944.3, 46.0)
        };
        
        public static List<Vector3> mowerSpawns = new List<Vector3>
        {
            new Vector3(-1350.8, 132.6, 56.2),
            new Vector3()
        };

        public static List<MowableLawn> lawns = new List<MowableLawn>
        {
            new MowableLawn
            {
                pay = 300,
                stops = new List<Vector3>
                {
                    new Vector3(-1311.6, 98.4, 55.8),
                    new Vector3(-1304.4, 135.1, 58.2)
                }
            }
        };

        public LawnMowerJob()
        {
            KeyPressEvents.keyPress_Y += showJobPrompt;

            startPositions.ForEach(start =>
            {
                NAPI.Blip.CreateBlip(351, start, 1f, 2, "Lawn Mower Job", 255, 0, true, 0, 0);

                MarkersAndLabels.setPlaceMarker(start);
                MarkersAndLabels.setTextLabel(start, "Lawn Mower Job\nUse ~y~Y~w~ to interact.", 2f);
            });

            lawns.ForEach(lawn =>
            {
                initLawnPositions(lawn.stops);
            });

            mowerSpawns.ForEach(spawn =>
            {
                initMowerSpawn(spawn);
            });
        }

        #region Global Methods
        private static void showJobPrompt(Player player)
        {
            Vector3 start = startPositions.Where(s => player.checkIsWithinCoord(s, 2)).FirstOrDefault();

            if (start == null) return;

            MowableLawn lawn = lawns[startPositions.IndexOf(start)];

            uiHandling.sendPrompt(player, "fa-solid fa-briefcase", "Lawnmower Job", $"Are you sure you want to start the lawn mower job? You will get paid ${lawn.pay.ToString("N0")}.", "server:jobs:lawnMower:start");
        }

        private static void initLawnPositions(List<Vector3> positions)
        {
            positions.ForEach(pos =>
            {
                ColShape posCol = NAPI.ColShape.CreateSphereColShape(pos, 2f, 0);

                posCol.OnEntityEnterColShape += (col, player) =>
                {
                    if (col.Equals(posCol)) handleEnterPos(player, pos);
                };
            });
        }

        private static void initMowerSpawn(Vector3 spawnPos)
        {
            ColShape finishJob = NAPI.ColShape.CreateSphereColShape(spawnPos, 3f);

            finishJob.OnEntityEnterColShape += (col, player) =>
            {
                if (!col.Equals(finishJob)) return;

                DbCharacter character = player.getPlayerCharacterData();
                FreeLanceJobData job = player.getFreelanceJobData();

                if (job == null || character == null || job != null && job.jobId != jobId || !FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.LawnMower)) return;

                if (!job.jobFinished) return;

                MowableLawn targetLawn = player.GetData<MowableLawn>(_currentMowerJobKey);

                if (targetLawn == null) return;

                character.salary_amount += targetLawn.pay;

                player.setPlayerCharacterData(character, false, true);
                FreelanceJobSystem.deleteFreeLanceVehs(player);
                MarkersAndLabels.removeClientBlip(player);
                MarkersAndLabels.flushClientBlips(player);

                player.SendChatMessage(ChatUtils.freelanceJobs + $"You have completed the lawn mower job. {ChatUtils.moneyGreen}${targetLawn.pay.ToString("N0")}{ChatUtils.White} has been paid into your salary.");
            };
        }

        private static void handleEnterPos(Player player, Vector3 pos)
        {
            FreeLanceJobData job = player.getFreelanceJobData();
            MowableLawn lawn = player.GetData<MowableLawn>(_currentMowerJobKey);

            if (job == null || lawn == null || !FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.LawnMower)) return;

            if (lawn.stopsDone.Contains(pos)) return;

            uiHandling.sendNotification(player, "~g~Mowed grass", false, true, "Mows grass...");
            MarkersAndLabels.deleteClientBlip(player, lawn.stops.IndexOf(pos));

            if (job.jobLevel >= lawn.stops.Count - 1)
            {
                job.jobFinished = true;
                player.setFreelanceJobData(job);

                player.SendChatMessage(ChatUtils.freelanceJobs + "Head back to the starting area to collect your pay.");
                MarkersAndLabels.addBlipForClient(player, 108, "Job Pay", mowerSpawns[lawns.IndexOf(lawn)], 2, 255, -1, true, true);
                return;
            }

            lawn.stopsDone.Add(pos);
            job.jobLevel++;

            player.setFreelanceJobData(job);
            player.SetCustomData(_currentMowerJobKey, lawn);
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:jobs:lawnMower:start")]
        public void startLawnMowerJob(Player player)
        {
            if (FreelanceJobSystem.hasAJob(player, jobId) || FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

            Vector3 start = startPositions.Where(s => player.checkIsWithinCoord(s, 2)).FirstOrDefault();

            if (start == null) return;

            int idx = startPositions.IndexOf(start);

            MowableLawn lawn = lawns[idx];
            Vector3 spawnPos = mowerSpawns[idx];

            player.SetCustomData(_currentMowerJobKey, lawn);

            player.setFreelanceJobData(new FreeLanceJobData
            {
                jobId = jobId,
                jobLevel = -1,
                jobName = jobName,
                jobStartedUnix = CommandUtils.generateUnix()
            });

            FreelanceJobSystem.createFreelanceVehicle(player, mowerSpawnName, spawnPos, -142.5f, jobId, jobName, "MOW");
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void initMowerPositions(Player player, Vehicle vehicle, sbyte seatId)
        {
            FreeLanceJobData job = player.getFreelanceJobData();
            MowableLawn lawn = player.GetData<MowableLawn>(_currentMowerJobKey);

            if (job == null || lawn == null || job != null && job.jobId != jobId) return;

            if (FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.LawnMower) && job.jobLevel == -1)
            {
                job.jobLevel = 0;

                MarkersAndLabels.loadClientBlips(player, lawn.stops, "Lawn Mowing", 1, 2, true);
                player.SendChatMessage(ChatUtils.freelanceJobs + "Head to all positions marked on the GPS. You will get paid once the mowing job is complete.");
                player.setFreelanceJobData(job);
            }
        }
        #endregion

    }
}