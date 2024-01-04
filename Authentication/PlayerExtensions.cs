using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Authentication
{
    public static class PlayerExtensions
    {
        public static void setPlayerToLoginScreen(this Player player)
        {
            player.Dimension = Auth._startDimension;
            player.TriggerEvent("client:loginStart");
            uiHandling.pushRouterToClient(player, Browsers.LoginPage);
        }

    }
}
