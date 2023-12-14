using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using static CloudRP.HousingSystem.Interiors;

namespace CloudRP.HousingSystem
{
    public class HousingSystem : Script
    {
        public static string _housingDataIdentifier = "houseData";

        [ServerEvent(Event.ResourceStart)]
        public void loadAllHouses()
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<House> houses = dbContext.houses.ToList();

                foreach(House house in houses)
                {
                    loadAHouse(house);
                }
            }

        }

        public static void loadAHouse(House house)
        {
            List<ColShape> loadedHouses = NAPI.Pools.GetAllColShapes();

            foreach(ColShape colShape in loadedHouses)
            {
                House houseColData = colShape.GetData<House>(_housingDataIdentifier);

                if(houseColData != null && houseColData.house_id == house.house_id)
                {
                    house.houseLabel.Delete();
                    house.houseMarker.Delete();

                    if (house.priceLabel != null)
                    {
                        house.priceLabel.Delete();
                    }

                    house.houseCol.Delete();
                }
            }

            Vector3 housePos = new Vector3(house.house_position_x, house.house_position_y, house.house_position_z);

            TextLabel priceLabel = null;
            if(house.blip_visible)
            {
                Vector3 pricePos = new Vector3(housePos.X, housePos.Y, housePos.Z + 0.4);
                priceLabel = MarkersAndLabels.setTextLabel(pricePos, $"~g~On sale for {house.house_price.ToString("C")}", 20f);
            }

            TextLabel houseLabel = MarkersAndLabels.setTextLabel(housePos, house.house_name + " #" + house.house_id + "\n use ~y~Y~w~ to interact", 20f);
            Marker houseMarker = MarkersAndLabels.setPlaceMarker(housePos);
            ColShape houseCol = NAPI.ColShape.CreateSphereColShape(housePos, 2f, 0);

            Blip houseBlip = NAPI.Blip.CreateBlip(492, housePos, 1.0f, 43, house.house_name, 255, 20, true, 0, 0);

            house.priceLabel = priceLabel;
            house.houseLabel = houseLabel;
            house.houseMarker = houseMarker;
            house.houseBlip = houseBlip;

            house.houseCol = houseCol;

            houseCol.SetData(_housingDataIdentifier, house);
            houseCol.SetSharedData(_housingDataIdentifier, house);
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void addHouseData(ColShape house, Player player)
        {
            House colData = house.GetData<House>(_housingDataIdentifier);

            if(colData != null)
            {
                player.SetData(_housingDataIdentifier, colData);
                player.SetSharedData(_housingDataIdentifier, colData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeHouseData(ColShape house, Player player)
        {
            House colData = house.GetData<House>(_housingDataIdentifier);

            if(colData != null)
            {
                player.ResetData(_housingDataIdentifier);
                player.ResetSharedData(_housingDataIdentifier);
            }
        }

        [RemoteEvent("server:loadHouseForPlayer")]
        public void loadHouseForPlayer(Player player)
        {
            House houseData = player.GetData<House>(_housingDataIdentifier);

            if(houseData != null)
            {
                Interior findInterior = availableInteriors
                    .Where(inte => inte.id == houseData.house_interior_id)
                    .FirstOrDefault();

                if(findInterior != null)
                {
                    player.Dimension = (uint)houseData.house_id; 
                    player.Position = findInterior.interiorPosition;
                    player.SendChatMessage(ChatUtils.info + " You entered house #"+houseData.house_id);
                }
            }
        }

    }
}
