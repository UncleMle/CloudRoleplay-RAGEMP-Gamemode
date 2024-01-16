using CloudRP.PlayerSystems.PlayerData;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverJob
    {
        private static string _busDepoColShapeData = "playerEnteredBusDepoColshape";
        public static List<BusDepo> busDepos = new List<BusDepo>
        {
            new BusDepo
            {
                depoId = 0,
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
                MarkersAndLabels.setTextLabel(busDepo.depoStartPosition, busDepo.depoName, 0);

                ColShape depoCol = NAPI.ColShape.CreateSphereColShape(busDepo.depoStartPosition, 2f, 0);

                depoCol.OnEntityEnterColShape += (col, player) =>
                {
                    if(col.Equals(depoCol))
                    {
                        player.SetCustomSharedData(_busDepoColShapeData, busDepo);
                    }
                };

                depoCol.OnEntityExitColShape += (col, player) =>
                {
                    if(col.Equals(depoCol))
                    {
                        player.ResetSharedData(_busDepoColShapeData);
                    }
                };
            });
        }

        [RemoteEvent("server:playerAttemptBusJobStart")]
        public void startBusJob(Player player)
        {
            BusDepo depoData = player.GetOwnSharedData<BusDepo>(_busDepoColShapeData);

            if(depoData != null)
            {
                Console.WriteLine("Started.");
            }
        }
    }
}
