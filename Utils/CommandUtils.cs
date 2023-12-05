using CloudRP.Character;
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

        public static Player getPlayerFromNameOrId(string nameOrId)
        {
            List<Player> allPlayers = NAPI.Pools.GetAllPlayers();
            Player returnPlayer = null;

            foreach(Player findPlayer in allPlayers)
            {
                DbCharacter characterData = PlayersData.getPlayerCharacterData(findPlayer);

                if (characterData == null) break;

                string findPlayerCharacterName = characterData.character_name.ToLower();
                int? findPlayerId = tryParse(nameOrId);

                if(findPlayerId != null && findPlayerId == findPlayer.Id)
                {
                    returnPlayer = findPlayer;
                    break;
                }

                string nameFind = nameOrId.ToLower();

                if(nameFind == findPlayerCharacterName)
                {
                    returnPlayer = findPlayer;
                    break;  
                }
                
                string lname = findPlayerCharacterName.Split("_")[1];
                string fname = findPlayerCharacterName.Split("_")[0];


                if (nameFind == fname || nameFind == lname)
                {
                    returnPlayer = findPlayer;
                    break;
                }
                

            }

            return returnPlayer;
        }

        public static void notFound(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, $"{ChatUtils.error}This player wasn't found");
        }

        public static int? tryParse(string name)
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
            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.error + message);
        } 
        
        public static void successSay(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.Success + message);
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

        public static void sendToAllPlayers(string message)
        {
            NAPI.Chat.SendChatMessageToAll(message);
        }

        public static string formatCharName(string name)
        {
            return name.Replace("_", " ");
        }

        public static string getCharName(string givenName)
        {
            string[] subs = givenName.Split(" ");

            for (int i = 0; i < subs.Length; i++)
            {
                subs[i] = Char.ToUpper(subs[i][0]) + subs[i].Substring(1);
            }

            string name = string.Join("_", subs);

            return name.ToLower();
        }

        public static long generateUnix()
        {
            return DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        }

        public static DateTime unixTimeStampToDateTime(double unixTimeStamp)
        {
            DateTime dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            dateTime = dateTime.AddSeconds(unixTimeStamp).ToLocalTime();
            return dateTime;
        }
    }
}
