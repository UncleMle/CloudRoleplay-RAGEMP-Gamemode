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

            house.priceLabel = priceLabel;
            house.houseLabel = houseLabel;
            house.houseMarker = houseMarker;

            house.houseCol = houseCol;

            houseCol.SetData(_housingDataIdentifier, house);
            houseCol.SetSharedData(_housingDataIdentifier, house);
        }

        [Command("addhouse", "~r~/addhouse [houseName] [garageSize] [price]")]
        public static void addHouseCommand(Player player, string houseName, int garageSize, int housePrice)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return; 

            if (userData.adminLevel > (int)AdminRanks.Admin_SeniorAdmin)
            {
                House house = new House
                {
                    blip_visible = true,
                    garage_size = garageSize,
                    house_interior = "Example",
                    house_owner_id = characterData.character_id,
                    house_price = housePrice,
                    house_name = houseName,
                    house_position_x = player.Position.X,
                    house_position_y = player.Position.Y,
                    house_position_z = player.Position.Z,
                };

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.houses.Add(house);
                    dbContext.SaveChanges();

                    loadAHouse(house);

                    AdminUtils.staffSay(player, $"You created a new house with id {house.house_id}");
                }
            }
            else AdminUtils.sendNoAuth(player);

        }

    }
}
