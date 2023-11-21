using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class CommandUtils : Script
    {
        public static Player getPlayerFromNameOrId(Player player, string nameOrId)
        {
            List<Player> allPlayers = NAPI.Pools.GetAllPlayers();
            Player returnPlayer = null;

            foreach (Player loopPlayer in allPlayers)
            {
                User userData = PlayersData.getPlayerAccountData(player);
                if (userData == null) return null;
                if(userData.username == nameOrId)
                {
                    returnPlayer = loopPlayer;
                    break;
                }

                int? pid = tryParse(nameOrId);

                if (pid != null && player.Id == pid)
                {
                    returnPlayer = loopPlayer;
                    break;
                }                
            }

            if(returnPlayer == null)
            {
                notFound(player);
            }

            return returnPlayer;
        }

        public static void notFound(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, $"{Chat.error}This player wasn't found");
        }

        private static int? tryParse(string name)
        {
            try
            {
                int parsedInt = int.Parse(name);
                return parsedInt;
            } catch 
            {
                return null;
            }
        }

        public static void errorSay(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, Chat.error + message);
        }
    }
}
