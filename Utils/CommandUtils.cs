using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class CommandUtils : Script
    {
        public static double _rp_commands_radius = 20.0;

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

        public static List<Player> getPlayersInRadius(Player player, double radius)
        {
            return NAPI.Player.GetPlayersInRadiusOfPlayer(radius, player);
        }

        public static void sendMessageToPlayersInRadius(Player player, string message, double radius)
        {
            List<Player> closePlayers = getPlayersInRadius(player, radius);
            
            foreach(Player closePlayer in closePlayers)
            {
                NAPI.Chat.SendChatMessageToPlayer(closePlayer, message);
            }
        }

        public static string formatCharName(string name)
        {
            return name.Replace("_", " ");
        }
    }
}
