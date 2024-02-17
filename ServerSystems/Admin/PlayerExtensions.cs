using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;

namespace CloudRP.ServerSystems.Admin
{
    public static class PlayerExtensions
    {
        public static void setAdminDuty(this Player player, bool toggle)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData != null && characterData != null && userData.admin_status > (int)AdminRanks.Admin_SeniorSupport)
            {
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
                    player.SetData(AdminSystem._adminLastPositionKey, player.Position);
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
