using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.NpcInteractions;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverJob : Script
    {
        #region Init
        public static string JobName = "Bus Driver";
        private static readonly string _busDepoColShapeData = "playerEnteredBusDepoColshape";
        private static readonly string _busVehicleData = "busDriverJobVehicleData";
        private static readonly string _busJobPlayerData = "busDriverPlayerJobData";
        private static int busStopCooldown_seconds = 6;
        public static List<BusDepo> busDepos = new List<BusDepo>
        {
            new BusDepo
            {
                depoId = 0,
                busStartPosition = new Vector3(-233.7, 6188.2, 31.5),
                busStartRotation = 133.5f,
                depoName = "Duluoz Bus Depot",
                depoStartPosition = new Vector3(-236.6, 6202.3, 31.9),
                buses = new List<string> {
                    "bus" // Change these if you have modded buses you want to use
                }
            },
            new BusDepo
            {
                depoId = 1,
                busStartPosition = new Vector3(423.3, -621.0, 28.5),
                busStartRotation = -177.3f,
                depoName = "Dashound Bus Depot",
                depoStartPosition = new Vector3(436.3, -647.5, 28.7),
                buses = new List<string> {
                    "bus" // Change these if you have modded buses you want to use
                }
            }
        };

        public BusDriverJob()
        {
            foreach (KeyValuePair<float, Vector3> stop in BusDriverRoutes.customBusStops)
            {
                NAPI.Object.CreateObject(NAPI.Util.GetHashKey("prop_busstop_02"), stop.Value, new Vector3(0, 0, stop.Key), 255);
            }

            BusDriverRoutes.busRoutes.ForEach(route =>
            {
                int idx = BusDriverRoutes.busRoutes.IndexOf(route);

                route.routeId = idx;
            });

            busDepos.ForEach(busDepo =>
            {
                List<BusRoute> routes = BusDriverRoutes.busRoutes
                .Where(route => route.ownerDepoId == busDepo.depoId)
                .ToList();

                NAPI.Blip.CreateBlip(513, busDepo.depoStartPosition, 1.0f, 46, busDepo.depoName, 255, 2f, true, 0, 0);

                RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                {
                    menuTitle = "Bus Depot",
                    raycastMenuItems = new List<string> { "Start Bus Job" },
                    raycastMenuPosition = busDepo.depoStartPosition,
                    targetMethod = startBusJob
                });

                ColShape depoCol = NAPI.ColShape.CreateSphereColShape(busDepo.depoStartPosition, 2f, 0);
                ColShape busStartCol = NAPI.ColShape.CreateSphereColShape(busDepo.busStartPosition, 8f, 0);

                depoCol.OnEntityEnterColShape += (col, player) =>
                {
                    if(col.Equals(depoCol))
                    {
                        player.SetCustomData(_busDepoColShapeData, busDepo);
                        player.SetCustomSharedData(_busDepoColShapeData, busDepo);
                    }
                };

                depoCol.OnEntityExitColShape += (col, player) =>
                {
                    if(col.Equals(depoCol))
                    {
                        player.ResetData(_busDepoColShapeData);
                        player.ResetSharedData(_busDepoColShapeData);
                    }
                };

                if(routes.Count > 0)
                {
                    routes.ForEach(route =>
                    {
                        initRoute(busDepo, route, busStartCol);
                    });
                }
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {busDepos.Count} bus depots were loaded.");
        }
        #endregion

        #region Global Events
        public static Vehicle createBusJobVehicle(Player player, string busType, BusDepo data)
        {
            DbCharacter playerData = player.getPlayerCharacterData();
            Vehicle newBus = null;

            if (playerData != null)
            {
                newBus = VehicleSystem.buildVolatileVehicle(player, busType, data.busStartPosition, data.busStartRotation, "BUS" + playerData.character_id);
                
                if(newBus != null)
                {
                    newBus.setFreelanceJobData(new FreeLanceJobVehicleData
                    {
                        jobId = (int)FreelanceJobs.BusJob,
                        characterOwnerId = playerData.character_id,
                        jobName = JobName
                    });
                }
            }

            return newBus;
        }

        public void startBusJob(Player player, string rayMenuOption)
        {
            BusDepo depoData = player.GetData<BusDepo>(_busDepoColShapeData);

            if (depoData != null)
            {
                if (!FreelanceJobSystem.hasAJob(player, (int)FreelanceJobs.BusJob))
                {
                    List<BusRoute> availableRoutes = BusDriverRoutes.busRoutes
                        .Where(route => route.ownerDepoId == depoData.depoId)
                        .ToList();

                    if (FreelanceJobSystem.hasFreeLanceVehicle(player)) return;

                    if (availableRoutes.Count > 0)
                    {
                        uiHandling.resetMutationPusher(player, MutationKeys.BusDriverJobRoutes);

                        availableRoutes.ForEach(route =>
                        {
                            uiHandling.handleObjectUiMutationPush(player, MutationKeys.BusDriverJobRoutes, route);
                        });

                        uiHandling.pushRouterToClient(player, Browsers.ViewBusRoutes);
                    }
                }
            }
        }

        private static void initRoute(BusDepo busDepo, BusRoute route, ColShape originCol)
        {
            route.stops.ForEach(stop =>
            {
                ColShape stopColshape = NAPI.ColShape.CreateSphereColShape(stop.stopPos, 3.5f, 0);

                originCol.OnEntityEnterColShape += (col, player) =>
                {
                    FreeLanceJobData jobData = player.getFreelanceJobData();
                    DbCharacter characterData = player.getPlayerCharacterData();
                    BusRoute selectedRoute = player.GetData<BusRoute>(_busJobPlayerData);

                    if (characterData != null && col.Equals(originCol) && selectedRoute != null && jobData != null && player.IsInVehicle && jobData.jobId == (int)FreelanceJobs.BusJob && jobData.jobFinished)
                    {
                        FreeLanceJobVehicleData vehicleData = player.Vehicle.getFreelanceJobData();

                        if (vehicleData != null)
                        {
                            jobData.jobFinished = false;
                            jobData.jobLevel = -1;
                            player.setFreelanceJobData(jobData);

                            player.addPlayerSalary(selectedRoute.routePay, "Bus Driver Job Pay");

                            player.SendChatMessage(ChatUtils.freelanceJobs + $"{ChatUtils.moneyGreen}${selectedRoute.routePay}{ChatUtils.White} has been paid into your salary for completeting the {selectedRoute.routeName} route.");
                            player.Vehicle.Delete();
                        }
                    }
                };

                stopColshape.OnEntityEnterColShape += (col, player) =>
                {
                    if (col.Equals(stopColshape) && player.IsInVehicle && player.VehicleSeat == 0 && player.Vehicle.getFreelanceJobData()?.jobId == (int)FreelanceJobs.BusJob)
                    {
                        FreeLanceJobData jobData = player.getFreelanceJobData();
                        int idx = route.stops.IndexOf(stop);

                        if (jobData != null && jobData.jobId == (int)FreelanceJobs.BusJob && ((idx - jobData.jobLevel) == 1 || idx == 0 && jobData.jobLevel == -1))
                        {
                            jobData.jobLevel = idx;
                            player.setFreelanceJobData(jobData);

                            player.TriggerEvent("client:busFreezeForStop", true);
                            uiHandling.sendNotification(player, "Loading passengers...", false, true, "Stops at bus stop..");
                            player.Vehicle.openAllDoors();

                            NAPI.Task.Run(() =>
                            {
                                if (NAPI.Player.IsPlayerConnected(player) && player.IsInVehicle && player.Vehicle.getFreelanceJobData()?.characterOwnerId == player.getPlayerCharacterData()?.character_id)
                                {
                                    player.TriggerEvent("client:busFreezeForStop", false);
                                    player.Vehicle.closeAllDoors();
                                    uiHandling.sendNotification(player, "Finished loading passengers.", false);

                                    if (idx + 1 < route.stops.Count)
                                    {
                                        idx++;
                                        Stop nextStop = route.stops[idx];
                                        
                                        player.Vehicle.SetSharedData(_busVehicleData, new BusSharedData
                                        {
                                            destination = route.stops.Last().stopName,
                                            nextStop = nextStop.stopName
                                        });

                                        player.TriggerEvent("client:setBusDriverBlipCoord", nextStop.stopPos.X, nextStop.stopPos.Y, nextStop.stopPos.Z);
                                    }
                                    else
                                    {
                                        Vector3 goBackPos = busDepo.busStartPosition;
                                        player.TriggerEvent("client:setBusDriverBlipCoord", goBackPos.X, goBackPos.Y, goBackPos.Z, true);
                                        jobData.jobFinished = true;

                                        player.setFreelanceJobData(jobData);

                                        player.Vehicle.SetSharedData(_busVehicleData, new BusSharedData
                                        {
                                            destination = "~r~Terminated",
                                            nextStop = busDepo.depoName
                                        });

                                        player.SendChatMessage(ChatUtils.freelanceJobs + "You have finished the route. Head back to the bus depot to recieve your paycheck.");
                                    }
                                }
                            }, busStopCooldown_seconds * 1000);
                        }
                    }
                };
            });
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:startBusJobRoute")]
        public void startBusJobRoute(Player player, int routeId)
        {
            BusDepo depoData = player.GetData<BusDepo>(_busDepoColShapeData);

            if (depoData != null)
            {
                if(Vector3.Distance(player.Position, depoData.depoStartPosition) < 12)
                {
                    uiHandling.resetRouter(player);

                    List<BusRoute> availableRoutes = BusDriverRoutes.busRoutes
                        .Where(route => route.ownerDepoId == depoData.depoId)
                        .ToList();

                    BusRoute route = availableRoutes
                        .Where(route => route.routeId == routeId)
                        .FirstOrDefault();

                    if (availableRoutes.Count > 0 && route != null && BusDriverRoutes.busRoutes.Contains(route))
                    {
                        player.setFreelanceJobData(new FreeLanceJobData
                        {
                            jobName = JobName,
                            jobId = (int)FreelanceJobs.BusJob,
                            jobLevel = -1,
                            jobStartedUnix = CommandUtils.generateUnix()
                        });

                        Stop firstStop = route.stops[0];

                        Vector3 stopPos = firstStop.stopPos;
                        player.TriggerEvent("client:setBusDriverBlipCoord", stopPos.X, stopPos.Y, stopPos.Z);

                        if(VehicleSystem.checkVehInSpot(depoData.busStartPosition, 10) != null)
                        {
                            uiHandling.sendPushNotifError(player, "There is a vehicle blocking the bus spawn!", 6600);
                            return;
                        }

                        player.SetData(_busJobPlayerData, route);

                        string spawnBus = depoData.buses[new Random().Next(0, depoData.buses.Count)];
                        Vehicle bus = createBusJobVehicle(player, spawnBus, depoData);
                        bus.SetSharedData(_busVehicleData, new BusSharedData
                        {
                            destination = route.stops.Last().stopName,
                            nextStop = firstStop.stopName
                        });
                        
                        player.safePutIntoVehicle(bus, 0);
                        player.SendChatMessage(ChatUtils.freelanceJobs + "Your bus route has been started. Please follow the route once finished you will be paid. Don't exit your vehicle. You will be rewarded for good driving.");
                    }
                }
            }
        }
        #endregion

        #region Server Events 
        [ServerEvent(Event.PlayerExitVehicle)]
        public void removeBusJobStatus(Player player, Vehicle vehicle)
        {
            int rageId = vehicle.Id;

            if(vehicle.getFreelanceJobData()?.jobId == (int)FreelanceJobs.BusJob)
            {
                if(player.getFreelanceJobData() != null)
                {
                    player.setFreelanceJobData(new FreeLanceJobData
                    {
                        jobFinished = false,
                        jobId = (int)FreelanceJobs.BusJob,
                        jobLevel = -1,
                        jobName = JobName
                    });
                }
                player.TriggerEvent("client:busDriverclearBlips");
            }

            NAPI.Task.Run(() =>
            {
                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    if(veh.Id == rageId)
                    {
                        FreeLanceJobVehicleData freelanceVehicleData = vehicle.getFreelanceJobData();
                        DbCharacter character = player.getPlayerCharacterData();

                        if (freelanceVehicleData != null && character != null)
                        {
                            if (freelanceVehicleData.characterOwnerId == character.character_id && freelanceVehicleData.jobId == (int)FreelanceJobs.BusJob)
                            {
                                player.SendChatMessage(ChatUtils.freelanceJobs + $"Your vehicle has been returned to your employer. ({freelanceVehicleData.jobName})");
                                vehicle.Delete();
                            }
                        }
                    }
                });
            }, 1500);
        }
        #endregion
    }
}
