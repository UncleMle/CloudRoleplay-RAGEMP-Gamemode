using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.NpcInteractions;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections;
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
        public static readonly string _mowerJobsDoneKey = "server:jobs:lawnMower:jobsDone";
        public static readonly int jobId = (int)FreelanceJobs.LawnMower;
        public static readonly string jobName = "Lawn Mower";
        
        public static List<Vector3> mowerSpawns = new List<Vector3>
        {
            new Vector3(-1350.8, 132.6, 56.2),
            new Vector3(1831.1, 4939.2, 46.1)
        };

        public static int[] mowerNpcs = new int[]
        {
            NpcInteractions.buildPed(PedHash.Ammucity01SMY, new Vector3(-1353.6, 140.7, 56.3), 20f, "John - Mower Company", new string[]
            {
                "Start Mowing Job"
            }),
            NpcInteractions.buildPed(PedHash.Ammucity01SMY, new Vector3(1825.3, 4944.3, 46.0), 20f, "John - Mower Company", new string[]
            {
                "Start Mowing Job"
            })
        };

        public static List<MowableLawn> lawns = new List<MowableLawn>
        {
            new MowableLawn
            {
                npc = mowerNpcs[0],
                pay = 2700,
                stops = new List<Vector3>
                {
                    new Vector3(-1311.6, 98.4, 55.8),
                    new Vector3(-1304.4, 135.1, 58.2),
                    new Vector3(-1347.8, 153.5, 57.3),
                    new Vector3(-1298.4, 177.2, 59.3),
                    new Vector3(-1245.1, 160.6, 59.3),
                    new Vector3(-1240.4, 135.7, 58.3),
                    new Vector3(-1238.9, 29.9, 47.9),
                    new Vector3(-1316.0, 41.3, 53.5)
                }
            },
            new MowableLawn
            {
                npc = mowerNpcs[1],
                pay = 500,
                stops = new List<Vector3>
                {
                    new Vector3(1850.4, 4957.0, 50.7),
                    new Vector3(1858.7, 4935.4, 47.8),
                    new Vector3(1842.9, 4916.1, 44.6),
                    new Vector3(1815.0, 4913.2, 43.6),
                    new Vector3(1810.6, 4923.0, 43.7),
                    new Vector3(1871.3, 4916.2, 46.3),
                    new Vector3(1848.7, 4900.4, 43.9),
                    new Vector3(1827.3, 4831.0, 43.9)
                }
            }
        };

        public LawnMowerJob()
        {
            NpcInteractions.onNpcInteract += (Player player, int npcId, string raycastOption) =>
            {
                bool isNpc = mowerNpcs.Contains(npcId);

                if (!isNpc) return;

                showJobPrompt(player, npcId);
            };

            lawns.ForEach(lawn =>
            {
                initLawnPositions(lawn.stops);
            });

            mowerSpawns.ForEach(spawn =>
            {
                NAPI.Blip.CreateBlip(351, spawn, 1f, 2, "Lawn Mower Job", 255, 0, true, 0, 0);
                initMowerSpawn(spawn);
            });


            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {lawns.Count} mowable lawns were loaded.");
        }

        #region Global Methods
        private static void showJobPrompt(Player player, int npcId)
        {
            MowableLawn lawn = lawns
                .Where(l => l.npc == npcId)
                .FirstOrDefault();

            if (lawn == null) return;

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
            List<Vector3> stopsDone = player.GetData<List<Vector3>>(_mowerJobsDoneKey);

            if (job == null || lawn == null || stopsDone == null || !FreelanceJobSystem.checkValidFreelanceVeh(player, FreelanceJobs.LawnMower)) return;

            if (stopsDone.Contains(pos)) return;

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

            stopsDone.Add(pos);
            job.jobLevel++;

            player.setFreelanceJobData(job);
            player.SetCustomData(_mowerJobsDoneKey, stopsDone);
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:jobs:lawnMower:start")]
        public void startLawnMowerJob(Player player)
        {
            if (FreelanceJobSystem.hasAJob(player, jobId) || FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

            int npcId = NpcInteractions.getClosestPedByRange(player, 4f);

            MowableLawn lawn = lawns
                .Where(lawn => lawn.npc == npcId).FirstOrDefault();

            if(lawn == null) return;

            Vector3 spawnPos = mowerSpawns[lawns.IndexOf(lawn)];

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
                player.SetCustomData(_mowerJobsDoneKey, new List<Vector3>());
            }
        }
        #endregion

    }
}
