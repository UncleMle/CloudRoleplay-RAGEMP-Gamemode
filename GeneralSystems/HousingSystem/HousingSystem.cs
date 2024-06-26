﻿using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Transactions;
using static CloudRP.GeneralSystems.HousingSystem.Interiors;

namespace CloudRP.GeneralSystems.HousingSystem
{
    public class HousingSystem : Script
    {
        public static string _housingDataIdentifier = "houseData";
        public static Dictionary<House, Blip> houseBlips = new Dictionary<House, Blip>();

        public HousingSystem()
        {
            Main.resourceStart += loadAllHouses;
        }

        private static void loadAllHouses()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<House> houses = dbContext.houses.ToList();

                foreach (House house in houses)
                {
                    loadAHouse(house);
                }

                ChatUtils.startupPrint($"A total of {houses.Count} houses were loaded.");
            }
        }

        public static void loadAHouse(House house)
        {
            House.deleteById(house.house_id);

            Vector3 housePos = new Vector3(house.house_position_x, house.house_position_y, house.house_position_z);

            TextLabel priceLabel = null;

            if (house.blip_visible)
            {
                Vector3 pricePos = new Vector3(housePos.X, housePos.Y, housePos.Z + 0.4);
                priceLabel = MarkersAndLabels.setTextLabel(pricePos, $"~g~On sale for ${house.house_price.ToString("N0")}", 5f);
            }

            TextLabel houseLabel = MarkersAndLabels.setTextLabel(housePos, house.house_name + " #" + house.house_id + "\n use ~y~Y~w~ to interact", 5f);
            Marker houseMarker = MarkersAndLabels.setPlaceMarker(housePos);
            ColShape houseCol = NAPI.ColShape.CreateSphereColShape(housePos, 1f, 0);

            Blip houseBlip = NAPI.Blip.CreateBlip(492, housePos, 1.0f, 43, house.house_name, 255, 20, true, 0, 0);

            Interior findInterior = availableInteriors
                     .Where(inte => inte.id == house.house_interior_id)
                     .FirstOrDefault();

            if (findInterior != null)
            {
                house.houseInterior = findInterior;

                houseCol.SetData(_housingDataIdentifier, house);
                priceLabel.SetData(_housingDataIdentifier, house);
                houseCol.SetData(_housingDataIdentifier, house);
                houseLabel.SetData(_housingDataIdentifier, house);
                houseMarker.SetData(_housingDataIdentifier, house);
                houseBlip.SetData(_housingDataIdentifier, house);

                setHouseData(houseCol, house);
                loadInteriorData(house);
            }
            else
            {
                ChatUtils.formatConsolePrint("House with ID " + house.house_id + " was not loaded (interior not found)");
            }
        }

        [RemoteEvent("server:loadHouseForPlayer")]
        public void loadHouseForPlayer(Player player)
        {
            House houseData = player.GetData<House>(_housingDataIdentifier);
            DbCharacter characterData = player.getPlayerCharacterData();
            Vector3 interiorData = player.GetData<Vector3>(_housingInteriorIdentifier);

            if (houseData.isLocked)
            {
                uiHandling.sendNotification(player, "~r~This house is locked!", false);
                return;
            }

            if (houseData != null && characterData != null && interiorData == null)
            {
                Interior houseInterior = houseData.houseInterior;

                if (houseInterior != null)
                {
                    player.sleepClientAc();
                    characterData.player_dimension = (uint)houseData.house_id;
                    player.safeSetDimension((uint)houseData.house_id);
                    player.Position = houseInterior.interiorPosition;

                    setHouseDataForPlayer(player, houseData);
                    player.setPlayerCharacterData(characterData, false, true);
                }
            }
        }

        [RemoteEvent("server:exitHouseForPlayer")]
        public void exitHouseForPlayer(Player player)
        {
            Vector3 housePos = player.GetData<Vector3>(_housingInteriorIdentifier);
            DbCharacter characterData = player.getPlayerCharacterData();

            if (housePos != null && characterData != null)
            {
                player.sleepClientAc();
                player.Position = housePos;
                player.safeSetDimension(0);
                characterData.player_dimension = 0;

                player.setPlayerCharacterData(characterData, false, true);
                NAPI.Task.Run(() =>
                {
                    if (player != null)
                    {
                        player.ResetData(_housingInteriorIdentifier);
                        player.ResetSharedData(_housingInteriorIdentifier);
                    }
                }, 6000);
            }
        }

        [RemoteEvent("server:toggleHouseLock")]
        public void toggleHouseLock(Player player)
        {
            House houseData = player.GetData<House>(_housingDataIdentifier);
            DbCharacter characterData = player.getPlayerCharacterData();

            if (houseData != null && characterData != null && characterData.character_id == houseData.house_owner_id)
            {
                houseData.isLocked = !houseData.isLocked;
                House.updateHouseDataForWorld(houseData);

                uiHandling.sendNotification(player, $"~r~You {(houseData.isLocked ? "locked" : "unlocked")} this house.", false);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void addHouseData(ColShape colshape, Player player)
        {
            House colData = colshape.GetData<House>(_housingDataIdentifier);

            if (colData != null)
            {
                setHouseDataForPlayer(player, colData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeHouseData(ColShape colshape, Player player)
        {
            House colData = colshape.GetData<House>(_housingDataIdentifier);

            if (colData != null)
            {
                resetHouseDataForPlayer(player);
            }
        }

        public static void setHouseData(ColShape houseCol, House house)
        {
            if (houseCol == null) return;
            houseCol.SetData(_housingDataIdentifier, house);
            houseCol.SetSharedData(_housingDataIdentifier, house);
        }

        public static void setHouseDataForPlayer(Player player, House house)
        {
            player.SetData(_housingDataIdentifier, house);
            player.SetSharedData(_housingDataIdentifier, house);
        }


        public static void resetHouseDataForPlayer(Player player)
        {
            player.ResetData(_housingDataIdentifier);
            player.ResetSharedData(_housingDataIdentifier);
        }

    }
}
