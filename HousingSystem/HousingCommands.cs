using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.HousingSystem
{
    public class HousingCommands : Script
    {
        [Command("addhouse", "~r~/addhouse [houseName] [garageSize] [price]")]
        public void addHouseCommand(Player player, string houseName, int garageSize, int housePrice)
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
                    house_interior_id = 0,
                    house_owner_id = characterData.character_id,
                    house_price = housePrice,
                    house_name = houseName,
                    house_position_x = player.Position.X,
                    house_position_y = player.Position.Y,
                    house_position_z = player.Position.Z,
                };

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.houses.Add(house);
                    dbContext.SaveChanges();

                    HousingSystem.loadAHouse(house);

                    AdminUtils.staffSay(player, $"You created a new house with id {house.house_id}");
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("deletehouse", "~r~/deletehouse [houseId]")]
        public void deleteHouseCommand(Player player, int houseId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                House findH = House.getHouseById(houseId);

                if(findH != null)
                {
                    House.deleteById(findH.house_id);
                } else
                {
                    CommandUtils.errorSay(player, "This house wasn't found.");
                }

            }
            else AdminUtils.sendNoAuth(player);

        }
    }
}
