using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerData
{
    public static class PlayerUiExtensions
    {
        public static void clearChat(this Player player)
        {
            player.TriggerEvent("browser:clearChat");
        }

    }
}
