using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
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
        private static string _busDepoColShapeData = "playerEnteredBusDepoColshape";
        private static string _busVehicleData = "busDriverJobVehicleData";
        private static string _busStop = "busDriverJobStop";
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
                    "blfs08",
                    "blfs05"
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
                    "zxd40",
                    "bxd40"
                }
            }
        };

        public BusDriverJob()
        {
            busDepos.ForEach(busDepo =>
            {
                NAPI.Blip.CreateBlip(513, busDepo.depoStartPosition, 1.0f, 46, busDepo.depoName, 255, 2f, true, 0, 0);
                MarkersAndLabels.setPlaceMarker(busDepo.depoStartPosition);
                MarkersAndLabels.setTextLabel(busDepo.depoStartPosition, $"Use ~y~Y~w~ to start the {JobName} job.\n"+busDepo.depoName, 5.0f);

                ColShape depoCol = NAPI.ColShape.CreateSphereColShape(busDepo.depoStartPosition, 2f, 0);

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

                BusRoute route = BusDriverRoutes.busRoutes
                .Where(route => route.ownerDepoId == busDepo.depoId)
                .FirstOrDefault();

                if(route != null)
                {
                    route.stops.ForEach(stop =>
                    {
                        ColShape stopColshape = NAPI.ColShape.CreateSphereColShape(stop.stopPos, 8f, 0);

                        stopColshape.OnEntityEnterColShape += (col, player) =>
                        {
                            if(col.Equals(stopColshape) && player.IsInVehicle && player.Vehicle.getFreelanceJobData()?.jobId == (int)FreelanceJobs.BusJob)
                            {
                                FreeLanceJobData jobData = player.getFreelanceJobData();
                                int idx = route.stops.IndexOf(stop);

                                if(jobData != null && jobData.jobId == (int)FreelanceJobs.BusJob)
                                {
                                    jobData.jobLevel = idx;
                                    player.setFreelanceJobData(jobData);

                                    player.TriggerEvent("client:busFreezeForStop", true);

                                    NAPI.Task.Run(() =>
                                    {
                                        if(NAPI.Player.IsPlayerConnected(player) && player.IsInVehicle)
                                        {
                                            player.TriggerEvent("client:busFreezeForStop", false);

                                            if (idx + 1 < route.stops.Count)
                                            {
                                                Console.WriteLine(idx + 1);
                                                idx++;
                                                Stop nextStop = route.stops[idx];

                                                Console.WriteLine(JsonConvert.SerializeObject(nextStop));

                                                player.TriggerEvent("client:setBusDriverBlipCoord", nextStop.stopPos.X, nextStop.stopPos.Y, nextStop.stopPos.Z);
                                            }
                                            else
                                            {
                                                player.SendChatMessage("Route finished");
                                                player.TriggerEvent("client:busDriverclearBlips");
                                            }
                                        }
                                    }, busStopCooldown_seconds * 1000);
                                }
                            }
                        };
                    });
                }
            });
        }
        #endregion

        #region Global Events
        public static Vehicle createBusJobVehicle(Player player, string busType, BusDepo data)
        {
            DbCharacter playerData = player.getPlayerCharacterData();
            Vehicle newBus = null;

            if (playerData != null)
            {
                newBus = VehicleSystem.buildVolatileVehicle(player, busType, data.busStartPosition, data.busStartRotation, "BUSDRIVER");
                
                if(newBus != null)
                {
                    newBus.SetData(_busVehicleData, data);
                    newBus.SetData(FreelanceJobSystem._FreelanceJobVehicleDataIdentifier, new FreeLanceJobVehicleData
                    {
                        jobId = (int)FreelanceJobs.BusJob,
                        characterOwnerId = playerData.character_id,
                        jobName = JobName
                    });
                }
            }

            return newBus;
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:playerAttemptBusJobStart")]
        public void startBusJob(Player player)
        {
            BusDepo depoData = player.GetData<BusDepo>(_busDepoColShapeData);

            if(depoData != null)
            {
                if(!FreelanceJobSystem.hasAJob(player, (int)FreelanceJobs.BusJob))
                {
                    player.setFreelanceJobData(new FreeLanceJobData
                    {
                        jobName = JobName,
                        jobId = (int)FreelanceJobs.BusJob,
                        jobLevel = 0,
                        jobStartedUnix = CommandUtils.generateUnix()
                    });

                    List<BusRoute> availableRoutes = BusDriverRoutes.busRoutes
                        .Where(route => route.ownerDepoId == depoData.depoId)
                        .ToList();

                    if(availableRoutes.Count > 0)
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

        [RemoteEvent("server:startBusJobRoute")]
        public void startBusJobRoute(Player player, int routeId)
        {
            BusDepo depoData = player.GetData<BusDepo>(_busDepoColShapeData);

            if (depoData != null)
            {
                uiHandling.resetRouter(player);

                List<BusRoute> availableRoutes = BusDriverRoutes.busRoutes
                    .Where(route => route.ownerDepoId == depoData.depoId)
                    .ToList();

                if(availableRoutes.Count > 0 && availableRoutes[routeId] != null)
                {
                    BusRoute route = availableRoutes[routeId];

                    Vector3 stopPos = route.stops[0].stopPos;
                    player.TriggerEvent("client:setBusDriverBlipCoord", stopPos.X, stopPos.Y, stopPos.Z);

                    string spawnBus = depoData.buses[new Random().Next(0, depoData.buses.Count)];

                    player.SetIntoVehicle(createBusJobVehicle(player, spawnBus, depoData), 0);
                    player.SendChatMessage(ChatUtils.freelanceJobs + "Your bus route has been started. Please follow the route once finished you will be paid. Don't exit your vehicle. You will be rewarded for good driving.");
                }
            }

        }
        #endregion

        #region Server Events 
        [ServerEvent(Event.PlayerExitVehicle)]
        public void removeBusJobStatus(Player player, Vehicle vehicle)
        {
            FreeLanceJobVehicleData freelanceVehicleData = vehicle.getFreelanceJobData();
            DbCharacter character = player.getPlayerCharacterData();

            if(freelanceVehicleData != null && character != null)
            {
                if(freelanceVehicleData.characterOwnerId == character.character_id && freelanceVehicleData.jobId == (int)FreelanceJobs.BusJob)
                {
                    player.SendChatMessage(ChatUtils.freelanceJobs + $"Your vehicle has been returned to your employer. ({freelanceVehicleData.jobName})");
                    player.TriggerEvent("client:busDriverclearBlips");
                    vehicle.Delete();
                }
            }
        }
        #endregion
    }
}
