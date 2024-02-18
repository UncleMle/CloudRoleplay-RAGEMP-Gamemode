using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.NpcInteractions;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.RentableVehicles
{
    public class RentableVehicles : Script
    {
        public static List<RentableVehiclePoint> rentPoints = new List<RentableVehiclePoint>
        {
            new RentableVehiclePoint
            {
                rentPrice = 200,
                rentEndPos = new Vector3(-1038.7, -2677.9, 13.8),
                rentStartPos = new Vector3(-1030.8, -2675.9, 13.8),
                npcHeading = -32.8f,
                npcPed = PedHash.Abigail,
                npcSpawn = new Vector3(-1031.5, -2677.1, 13.8)
            },
            new RentableVehiclePoint
            {
                rentPrice = 400,
                npcHeading = -89.8f,
                npcPed = PedHash.Security01SMM,
                npcSpawn = new Vector3(387.9, -654.7, 28.8),
                rentEndPos = new Vector3(392.8, -657.8, 28.5),
                rentStartPos = new Vector3(389.6, -645.5, 28.8)
            }
        };


        public RentableVehicles()
        {
            NpcInteractions.onNpcInteract += handleNpcInteraction;

            rentPoints.ForEach(point =>
            {
                point.npcId = NpcInteractions.buildPed(PedHash.AnitaCutscene, point.npcSpawn, point.npcHeading, "Sophie - Rent a vehicle", new string[]
                {
                    "Rent a car",
                    "Rent a motorbike"
                });

                MarkersAndLabels.setPlaceMarker(point.rentStartPos);
                MarkersAndLabels.setTextLabel(point.rentStartPos, $"Rental Vehicle Point\nUse ~y~Y~w~ to interact", 5f);

                NAPI.Blip.CreateBlip(810, point.rentStartPos, 1f, 4, "Rental Vehicle Location", 255, 1f, true, 0, 0);
            });
        }

        private static void handleNpcInteraction(Player player, int npcId, string raycastOption)
        {
            Console.WriteLine($"{npcId} || {raycastOption}");
        }

    }
}
