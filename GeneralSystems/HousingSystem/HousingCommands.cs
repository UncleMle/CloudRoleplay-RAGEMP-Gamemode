using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.HousingSystem
{
    public class HousingCommands : Script
    {
        [Command("addhouse", "~r~/addhouse [garageSize] [price] [interiorId] [houseName]", GreedyArg = true)]
        public void addHouseCommand(Player player, int garageSize, int housePrice, int interiorId, string houseName)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            if (userData.admin_status > (int)AdminRanks.Admin_SeniorAdmin)
            {
                int totalAvailableInteriors = Interiors.availableInteriors.Count - 1;

                if (interiorId > totalAvailableInteriors || interiorId < 0)
                {
                    CommandUtils.errorSay(player, "Enter a valid interior id between 0 and " + totalAvailableInteriors);
                    return;
                }

                House house = new House
                {
                    blip_visible = true,
                    garage_size = garageSize,
                    house_interior_id = interiorId,
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

        [Command("deletehouse", "~r~/deletehouse [houseId] [deleteFromDb(true/false)]")]
        public void deleteHouseCommand(Player player, int houseId, bool deleteFromDb)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                House findH = House.getHouseById(houseId);

                if (findH != null)
                {
                    House.deleteById(findH.house_id, deleteFromDb);
                }
                else
                {
                    CommandUtils.errorSay(player, "This house wasn't found.");
                }

            }
            else AdminUtils.sendNoAuth(player);

        }
    }
}
