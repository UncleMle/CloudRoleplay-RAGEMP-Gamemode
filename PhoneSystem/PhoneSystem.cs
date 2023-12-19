using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CloudRP.PhoneSystem
{
    public class PhoneSystem : Script
    {
        public static string _phoneStatusIdentifer = "playerPhoneStatus";

        [RemoteEvent("server:myCarsApp::fetchVehicles")]
        public void fetchPlayerVehicles(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(characterData != null)
            {
                uiHandling.resetMutationPusher(player, MutationKeys.PhoneDataVehicles);

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> playerVehicles = dbContext.vehicles.Where(veh => veh.owner_id == characterData.character_id).ToList();

                    playerVehicles.ForEach(playerVehicle =>
                    {
                        playerVehicle.vehicle_key_holders = VehicleSystem.getVehicleKeyHoldersFromDb(playerVehicle);
                    });

                    List<PhoneUiVeh> phoneUiVeh = JsonConvert.DeserializeObject<List<PhoneUiVeh>>(JsonConvert.SerializeObject(playerVehicles));

                    phoneUiVeh.ForEach(phoneV =>
                    {
                        uiHandling.handleObjectUiMutationPush(player, MutationKeys.PhoneDataVehicles, phoneV);
                    });
                }
            }
        }

        [RemoteEvent("server:togglePhoneStatus")]
        public void togglePhoneStatus(Player player)
        {
            if(!player.GetData<bool>(_phoneStatusIdentifer))
            {
                player.SetSharedData(_phoneStatusIdentifer, true);
                player.SetData(_phoneStatusIdentifer, true);
            } else
            {
                player.ResetData(_phoneStatusIdentifer);
                player.ResetSharedData(_phoneStatusIdentifer);
            }

        }

    }
}
