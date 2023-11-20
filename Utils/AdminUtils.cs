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
            Dictionary<Player, User> onlineStaff = AdminUtils.gatherStaff();

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                Player recievingStaff = entry.Key;

                NAPI.Chat.SendChatMessageToPlayer(recievingStaff, message);
            }
        }

        public static Dictionary<Player, User> gatherStaff()
        {
            Dictionary<Player, User> onlinePlayers = Auth.UserData;
            Dictionary<Player, User> onlineStaff = new Dictionary<Player, User>();


            foreach (KeyValuePair<Player, User> entry in onlinePlayers)
            {
                Player playerData = entry.Key;
                User userData = entry.Value;

                if (userData.adminLevel > 0)
                {
                    onlineStaff.Add(playerData, userData);
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
            NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[STAFF]!{white} " + message);
        }
    }
}
