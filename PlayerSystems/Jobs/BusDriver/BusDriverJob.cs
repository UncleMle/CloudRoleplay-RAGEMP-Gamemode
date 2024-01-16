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
                busStartRotation = 133.5,
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
        public static void createBusJobVehicle(Vector3 position, int rot, string routeName)
        {
            Vehicle vehicle = NAPI.Vehicle.CreateVehicle(VehicleHash.Bus, position, rot, 111, 111, routeName, 255, false, true, 0);
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:playerAttemptBusJobStart")]
        public void startBusJob(Player player)
        {
            BusDepo depoData = player.GetData<BusDepo>(_busDepoColShapeData);

            if(depoData != null)
            {
                Console.WriteLine("Started.");
            }
        }
        #endregion
    }
}
