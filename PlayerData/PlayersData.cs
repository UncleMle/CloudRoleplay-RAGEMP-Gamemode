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

        public static void setPlayerAccountData(Player player, User userData)
        {
            player.SetData(_sharedAccountDataIdentifier, userData);
        }

        public static User? getPlayerAccountData(Player player)
        {
            User? playerData = player.GetData<User>(_sharedAccountDataIdentifier);
            return playerData;
        }
    }
}
