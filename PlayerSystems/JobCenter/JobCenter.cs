using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.JobCenter
{
    public class JobCenter : Script
    {
        public static readonly List<Vector3> jobCenterPositions = new List<Vector3>
        {
            new Vector3(-1153.1, -797.6, 15.5),
            new Vector3(916.4, 3576.9, 33.6)
        };

        public static List<JobCenterViewJob> availableJobs = new List<JobCenterViewJob>
        {
            new JobCenterViewJob
            {
                jobName = "Bus Driver",
                jobDescription = "Have fun driving around the city collecting passengers whilst making cash. What more could you want in life?",
                averagePay = 3800,
                jobPositions = new List<Vector3>
                {
                    new Vector3(-236.6, 6202.3, 31.9),
                    new Vector3(436.3, -647.5, 28.7)
                }
            },
            new JobCenterViewJob
            {
                jobName = "Trucker Job",
                averagePay = 3480,
                jobDescription = "Drive huge 18 wheeled rigs around LS keeping the city ticking.",
                jobPositions = new List<Vector3>
                {
                    new Vector3(-424.4, -2789.8, 6.5)
                }
            },
            new JobCenterViewJob
            {
                jobName = "Postal Job",
                averagePay = 3950,
                jobDescription = "Work for go postal delivering packages around the city.",
                jobPositions = new List<Vector3>
                {
                    new Vector3(-232.1, -914.9, 32.3)
                }
            },
            new JobCenterViewJob
            {
                jobName = "Gruppe Six Job",
                averagePay = 4568,
                jobDescription = "Work for Gruppe Six refilling the ATMs around the city.",
                jobPositions = new List<Vector3>
                {
                    new Vector3(-195.4, -835.3, 30.7)
                }
            },
            new JobCenterViewJob
            {
                jobName = "Garbage Job",
                averagePay = 3000,
                jobDescription = "Drive a garbage truck around the LS Hills removing garbage bags.",
                jobPositions = new List<Vector3>
                {
                    new Vector3(-322.2, -1545.8, 31.0)
                }
            },
            new JobCenterViewJob
            {
                jobName = "Lawn Mower Job",
                averagePay = 1600,
                jobDescription = "Enjoy mowing lawns whilst getting a nice paycheck. Easy work.",
                jobPositions = new List<Vector3>
                {
                    new Vector3(-1353.6, 140.7, 56.3),
                    new Vector3(1825.3, 4944.3, 46.0)
                }
            }
        };

        public JobCenter()
        {
            jobCenterPositions.ForEach(pos =>
            {
                NAPI.Blip.CreateBlip(408, pos, 1f, 4, "Job Center", 255, 1f, true, 0, 0);

                RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                {
                    menuTitle = "Job Center",
                    raycastMenuItems = new List<string> { "View available jobs" },
                    raycastMenuPosition = pos,
                    targetMethod = showCenterUi
                });
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {jobCenterPositions.Count} job centers were loaded.");
        }

        private static void showCenterUi(Player player, string rayOption)
        {
            uiHandling.resetMutationPusher(player, MutationKeys.JobCenterJobs);
            uiHandling.pushRouterToClient(player, Browsers.JobCenter, true);

            availableJobs.ForEach(job =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.JobCenterJobs, job);
            });
        }


        [RemoteEvent("server:jobCenter:showJobOnMap")]
        public void markJobOnGps(Player player, string jobName)
        {
            if (!player.checkIsWithinOneCoords(jobCenterPositions, 2)) return;

            JobCenterViewJob targetJob = availableJobs
                .Where(job => job.jobName == jobName)
                .FirstOrDefault();

            if (targetJob == null) return;

            Vector3 closest = targetJob.jobPositions.OrderBy(pos => Vector3.Distance(player.Position, pos)).ToList()[0];

            MarkersAndLabels.setClientWaypoint(player, closest);

            uiHandling.resetRouter(player);
            CommandUtils.successSay(player, $"The starting position for {targetJob.jobName} has been set as a waypoint on your gps.");
        }
    }
}
