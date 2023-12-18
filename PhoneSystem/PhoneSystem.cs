using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PhoneSystem
{
    public class PhoneSystem : Script
    {

        [RemoteEvent("server:myCarsApp::fetchVehicles")]
        public void fetchPlayerVehicles(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(characterData != null )
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> playerVehicles = dbContext.vehicles.Where(veh => veh.owner_id == characterData.owner_id).ToList();

                    uiHandling.handleObjectUiMutation(player, MutationKeys.PhoneDataVehicles, playerVehicles);
                }
            }
        }

    }
}
