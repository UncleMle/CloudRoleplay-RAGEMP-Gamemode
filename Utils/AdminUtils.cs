using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class AdminUtils : Script
    {
        public static string staffPrefix = "!{red}[STAFF]!{white} ";

        public static void sendNoAuth(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[Not Authorized]!{white}] " + "you are not authorized to use this command.");
        }

        public static void sendMessageToAllStaff(string message)
        {
            Dictionary<Player, User> onlineStaff = gatherStaff();

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                Player recievingStaff = entry.Key;

                NAPI.Chat.SendChatMessageToPlayer(recievingStaff, message);
            }
        }

        public static Dictionary<Player, User> gatherStaff()
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            Dictionary<Player, User> onlineStaff = new Dictionary<Player, User>();


            foreach(Player entry in onlinePlayers)
            {
                User userData = PlayersData.getPlayerAccountData(entry);
                if (userData != null && userData.adminLevel > (int)AdminRanks.Admin_None)
                {
                    onlineStaff.Add(entry, userData);
                }
            }

            return onlineStaff;
        }

        public static string getColouredAdminRank(User user)
        {
            string adminRank = RankList.adminRanksList[user.adminLevel];
            string adminRankColour = "!{" + RankList.adminRanksColours[user.adminLevel] + "}";


            return $"{adminRankColour}[{adminRank}] " + "!{white}";
        }

        public static void staffSay(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, staffPrefix + message);
        }

        public static bool checkUserData(Player player, User userData)
        {
            if(userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                return true;
            } else
            {
                sendNoAuth(player);
                return false;
            }
        }
    }
}
