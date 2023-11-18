using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {
        [Command("makeadmin")]
        public void makeAdmin(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "Example chat message");
        }

        [Command("makeaccount")]
        public void makeAccount(Player player) {
            NAPI.Chat.SendChatMessageToPlayer(player, "Make");

        }
    }
}
