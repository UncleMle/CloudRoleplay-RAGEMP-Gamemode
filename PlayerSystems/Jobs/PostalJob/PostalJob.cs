using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class PostalJob : Script
    {
        private static readonly Vector3 jobStartPosition = new Vector3(-232.1, -914.9, 32.3);

        public PostalJob()
        {
            KeyPressEvents.keyPress_Y += startPostalJob; 

            NAPI.Blip.CreateBlip(837, jobStartPosition, 1f, 62, "Postal OP", 255, 5f, true, 0, 0);
            MarkersAndLabels.setPlaceMarker(jobStartPosition);
            MarkersAndLabels.setTextLabel(jobStartPosition, "Postal OP\n Use ~y~Y~w~ to interact.", 5f);
        }

        public static void startPostalJob(Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured)
        {
            if (!player.checkIsWithinCoord(jobStartPosition, 2f) || isInSwitchNative || hasPhoneOut || isPauseMenuActive || isTyping || isInjured) return;

            uiHandling.pushRouterToClient(player, Browsers.PostalJobView, true);
        }

    }
}
