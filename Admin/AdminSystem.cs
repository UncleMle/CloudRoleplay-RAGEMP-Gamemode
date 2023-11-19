using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using static CloudRP.Authentication.Account;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {
        public bool test;

        [Command("aduty")]
        public void onAduty(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData != null && userData.adminLevel > 0)
            {
                userData.adminDuty = !userData.adminDuty;

                if(userData.adminDuty)
                {
                    AdminUtils.sendMessageToAllStaff($"{userData.username} is on duty ({userData.adminDuty})");
                } else
                {
                    AdminUtils.sendMessageToAllStaff($"{userData.username} is off duty ({userData.adminDuty})");
                }

                PlayersData.setPlayerAccountData(player, userData);

            } else AdminUtils.sendNoAuth(player);

        }

        [Command("staff")]
        public void staff(Player player)
        {
            int index = 0;
            foreach (var item in AdminUtils.gatherStaff())
            {
                index++;
                User user = item.Value;
                string duty = user.adminDuty ? "[!{green}On-Duty!{white}]" : "[!{red}Off-Duty!{white}]";

                NAPI.Chat.SendChatMessageToPlayer(player, index + $". {user.username} {duty}");
            }
        }

        [Command("client", "~r~/client [ename]")]
        public void eventTrigger(Player player, string eventName) {
            if (eventName == null) return;

            if(PlayersData.getPlayerAccountData(player).adminLevel > 7)
            {
                player.TriggerEvent(eventName);
                AdminUtils.staffSay(player, $"Triggered clientside event {eventName}");
            }
        }

        [Command("a", "~r~/adminchat [message]", GreedyArg = true, Alias = "adminchat")]
        public void adminChat(Player player, string message)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            if (userData.adminLevel > 0)
            {
                Dictionary<Player, User> onlineAdmins = AdminUtils.gatherStaff();

                string colouredAdminRank = AdminUtils.getColouredAdminRank(userData);

                foreach (KeyValuePair<Player, User> entry in onlineAdmins)
                {
                    User staff = entry.Value;

                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, "!{red}" + $"[AdminChat] " + "!{white}" + colouredAdminRank + staff.adminName + " !{grey}says:!{white} " + message);
                }
            }

        }

        [Command("togchat")]
        public void togChat(Player player)
        {
            test = !test;
            PlayersData.togglePlayerChat(player, test);
            Console.WriteLine(test);
        }


    }
}
