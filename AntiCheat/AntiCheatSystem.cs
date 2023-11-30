using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.AntiCheat
{
    class AntiCheatSystem : Script
    {
        public static double _alertRadius = 45.5;

        [ServerEvent(Event.PlayerDisconnected)]
        public void OnPlayerDisconnect(Player player, DisconnectionType type, string reason)
        {
            List<Player> playersInRange = NAPI.Player.GetPlayersInRadiusOfPlayer(_alertRadius, player);

            foreach (Player p in playersInRange)
            {
                string disconnectedMessage = ChatUtils.disconnected + "Player  [" + player.Id + "]  has disconnected from the server.";

                NAPI.Chat.SendChatMessageToPlayer(p, disconnectedMessage);
            }
        }

    }
}
