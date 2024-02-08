﻿using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.VehicleSystems.VehicleScrapyards
{
    public class VehicleScrapyards : Script
    {
        public static readonly int scrapPrice = 400;
        List<VehicleScrapyard> vehicleScrapyards = new List<VehicleScrapyard>
        {
            new VehicleScrapyard
            {
                name = "Strawberry Scrap",
                position = new Vector3(-455.4, -1706.5, 18.8)
            },
            new VehicleScrapyard
            {
                name = "Paleto Scrap",
                position = new Vector3(-234.9, 6263.6, 31.5)
            }
        };

        public VehicleScrapyards()
        {
            vehicleScrapyards.ForEach(scrap =>
            {
                NAPI.Blip.CreateBlip(569, scrap.position, 1f, 56, scrap.name, 255, 0, true, 0, 0);
                MarkersAndLabels.setTextLabel(scrap.position, $"Use ~y~/scrap~w~ to scrap your vehicle.\nCurrent scrap price ~g~${scrapPrice.ToString("N0")}", 8f);
                NAPI.Marker.CreateMarker(27, new Vector3(scrap.position.X, scrap.position.Y, scrap.position.Z - 0.9), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
                NAPI.Marker.CreateMarker(36, scrap.position, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
            });
        }

        [Command("scrap", "~y~Use: ~w~/scrap")]
        public void scrapVehicleCommand(Player player)
        {
            if(!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to scrap it.");
                return;
            }

            VehicleScrapyard targetScrap = vehicleScrapyards
                .Where(scrap => player.checkIsWithinCoord(scrap.position, 5f))
                .FirstOrDefault();

            if(targetScrap == null)
            {
                CommandUtils.errorSay(player, "You must be within a scrapyard to use this command.");
                return;
            }

            player.Vehicle.scrapVehicle(player);
        }
    }
}