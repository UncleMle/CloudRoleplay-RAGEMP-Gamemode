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
        [Command("aduty")]
        public void onAduty(Player player)
        {
            User userData = PlayerData.PlayersData.getPlayerAccountData(player);

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

        
    }
}
