using CloudRP.Authentication;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerData
{
    internal class PlayersData : Script
    {
        private static readonly string _sharedAccountDataIdentifier = "PlayerAccountData";
        private static readonly string _sharedCharacterDataIdentifier = "PlayerCharacterData";

        public static void setPlayerAccountData(Player player, User userData)
        {
            player.SetData(_sharedAccountDataIdentifier, userData);

            // Explicitly specify data as it will be sent freely to other clients;
            SharedData data = new SharedData
            {
                accountId = userData.accountId,
                adminDuty = userData.adminDuty,
                adminLevel = userData.adminLevel,
                adminName = userData.adminName,
                playerId = userData.playerId,
                username = userData.username,
            };

            player.SetSharedData(_sharedAccountDataIdentifier, data);
        }

        public static User getPlayerAccountData(Player player)
        {
            User playerData = player.GetData<User>(_sharedAccountDataIdentifier);
            return playerData;
        }

        public static void togglePlayerChat(Player player, bool toggle)
        {
            string mutationName = "setChatStatus";

            player.TriggerEvent("client:recieveUiMutation", mutationName, "toggle", toggle);
        }
    }
}
