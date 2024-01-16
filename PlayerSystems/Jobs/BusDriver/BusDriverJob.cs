using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverJob : Script
    {
        #region Init
        public static string JobName = "Bus Driver";
        private static string _busDepoColShapeData = "playerEnteredBusDepoColshape";
        private static string _busVehicleData = "busDriverJobVehicleData";
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
                    player.SetCustomData(FreelanceJobSystem._FreelanceJobDataIdentifier, new FreeLanceJobData
                    {
                        jobName = JobName,
                        jobStartedUnix = CommandUtils.generateUnix()
                    });


                    string spawnBus = depoData.buses[new Random().Next(0, depoData.buses.Count)];

                    player.SetIntoVehicle(createBusJobVehicle(player, spawnBus, depoData), 0);
                    player.SendChatMessage("Started route");
                }
            }
        }
        #endregion
    }
}
