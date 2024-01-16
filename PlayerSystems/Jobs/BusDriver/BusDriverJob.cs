using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
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
        private static string _busDepoColShapeData = "playerEnteredBusDepoColshape";
        public static List<BusDepo> busDepos = new List<BusDepo>
        {
            new BusDepo
            {
                depoId = 0,
                busStartPosition = new Vector3(-233.7, 6188.2, 31.5),
                busStartRotation = 133.5f,
                depoName = "Duluoz Bus Depot",
                depoStartPosition = new Vector3(-236.6, 6202.3, 31.9)
            }
        };

        public BusDriverJob()
        {
            busDepos.ForEach(busDepo =>
            {
                NAPI.Blip.CreateBlip(513, busDepo.depoStartPosition, 1.0f, 46, busDepo.depoName, 255, 2f, true, 0, 0);
                MarkersAndLabels.setPlaceMarker(busDepo.depoStartPosition);
                MarkersAndLabels.setTextLabel(busDepo.depoStartPosition, "Use ~y~Y~w~ to start the bus driver job.\n"+busDepo.depoName, 5.0f);

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
        public static Vehicle createBusJobVehicle(Player player, BusDepo data, string routeName)
        {
            DbCharacter playerData = player.getPlayerCharacterData();
            Vehicle newBus = null;

            if (playerData != null)
            {
                newBus = NAPI.Vehicle.CreateVehicle((uint)VehicleHash.Bus, data.busStartPosition, data.busStartRotation, 111, 111, routeName, 255, false, true, 0);
                newBus.SetData(FreelanceJobSystem._FreelanceJobVehicleDataIdentifier, data);

                newBus.saveVehicleData(new DbVehicle
                {
                    CreatedDate = DateTime.Now,
                    dirt_level = 0,
                    engine_status = true,
                    numberplate = "BUSDRIVER",
                    owner_name = playerData.character_name,
                    owner_id = playerData.character_id,
                    vehicle_fuel = 100,
                });
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
                player.SetIntoVehicle(createBusJobVehicle(player, depoData, "Test Route"), 0);
                player.SendChatMessage("Started route");
            }
        }
        #endregion
    }
}
