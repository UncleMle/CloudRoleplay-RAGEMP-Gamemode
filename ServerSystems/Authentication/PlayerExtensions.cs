using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Authentication
{
    public static class PlayerExtensions
    {
        public static void setPlayerToLoginScreen(this Player player, bool resetCam = true)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null && userData.adminDuty)
            {
                player.setAdminDuty(false);
            }

            player.Position = PlayersData.defaultLoginPosition;
            player.safeSetDimension(Auth._startDimension);

            if (resetCam)
            {
                player.TriggerEvent("client:loginCameraStart");
            }

            uiHandling.pushRouterToClient(player, Browsers.LoginPage);

            player.flushUserAndCharacterData(new string[]{
                PlayersData._sharedAccountDataIdentifier
            });

            player.ResetData(Commands._logoutIdentifier);
            player.ResetSharedData(Commands._logoutIdentifier);
        }

        public static bool isLoggingOut(this Player player)
        {
            return player.GetData<bool>(Commands._logoutIdentifier);
        }
    }

}
