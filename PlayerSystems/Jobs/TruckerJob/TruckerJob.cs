using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerJob : Script
    {
        public static Vector3 truckerJobStart = new Vector3(-424.4, -2789.8, 6.5);

        public TruckerJob()
        {
            NAPI.Blip.CreateBlip(477, truckerJobStart, 1f, 41, "Trucker Job", 255, 1f, true, 0, 0);

            KeyPressEvents.keyPress_Y += (Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured) =>
            {
                if(!isInSwitchNative && !hasPhoneOut && !isTyping && !isInVehicle && !isInjured)
                {
                    if(player.checkIsWithinCoord(truckerJobStart, 2f))
                    {
                        startTruckerJob(player);
                    }
                }
            };
        }

        private static void startTruckerJob(Player player)
        {
            Console.WriteLine("started.");
        }

    }
}
