using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Admin
{
    public static class PlayerExtensions 
    {
        public static void setAdminDuty(this Player player, bool toggle)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if(userData != null && characterData != null && userData.admin_status > (int)AdminRanks.Admin_SeniorSupport)
            {
                Console.WriteLine(JsonConvert.SerializeObject(userData));

                userData.adminDuty = toggle;

                if (userData.admin_ped != "none")
                {
                    userData.showAdminPed = userData.adminDuty;
                }
                else
                {
                    userData.showAdminPed = false;
                }

                player.setPlayerAccountData(userData);

                if (userData.adminDuty)
                {
                    AdminSystem.saveAdutyPosition(userData, player.Position);
                }
                else
                {
                    userData.isFlying = false;
                    player.TriggerEvent("admin:endFly");

                    if (userData.admin_ped != "none")
                    {
                        player.setCharacterModel(characterData.characterModel);
                        player.setCharacterClothes(characterData.characterClothing);
                    }
                }

                player.setPlayerAccountData(userData);
            }
        }

    }
}
