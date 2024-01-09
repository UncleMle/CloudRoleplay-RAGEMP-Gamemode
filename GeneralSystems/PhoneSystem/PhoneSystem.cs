using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CloudRP.GeneralSystems.PhoneSystem
{
    public class PhoneSystem : Script
    {
        public static string _phoneStatusIdentifer = "playerPhoneStatus";

        [RemoteEvent("server:myCarsApp::fetchVehicles")]
        public void fetchPlayerVehicles(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData != null)
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
            if (!player.GetData<bool>(_phoneStatusIdentifer))
            {
                player.SetCustomSharedData(_phoneStatusIdentifer, true);
                player.SetCustomData(_phoneStatusIdentifer, true);
            }
            else
            {
                player.ResetData(_phoneStatusIdentifer);
                player.ResetSharedData(_phoneStatusIdentifer);
            }

        }

    }
}
