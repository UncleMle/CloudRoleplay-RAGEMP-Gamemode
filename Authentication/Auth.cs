using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            NAPI.Chat.SendChatMessageToAll($"Player {player.Name}");
        }
    }
}
