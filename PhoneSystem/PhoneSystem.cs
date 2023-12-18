using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
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

            if(characterData != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> playerVehicles = dbContext.vehicles.Where(veh => veh.owner_id == characterData.owner_id).ToList();

                    List<PhoneUiVeh> phoneUiVeh = JsonConvert.DeserializeObject<List<PhoneUiVeh>>(JsonConvert.SerializeObject(playerVehicles));
                    
                    uiHandling.handleObjectUiMutation(player, MutationKeys.PhoneDataVehicles, phoneUiVeh);
                }
            }
        }

    }
}
