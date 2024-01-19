using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerJob : Script
    {
        public static Vector3 truckerJobStart = new Vector3(-424.4, -2789.8, 6.5);

        #region Init
        public TruckerJob()
        {
            AvailableJobs.availableJobs.ForEach(job =>
            {
                job.jobId = AvailableJobs.availableJobs.IndexOf(job);
            });

            NAPI.Blip.CreateBlip(477, truckerJobStart, 1f, 41, "Trucker Job", 255, 1f, true, 0, 0);
            MarkersAndLabels.setPlaceMarker(truckerJobStart);
            MarkersAndLabels.setTextLabel(truckerJobStart, "Use ~y~Y~w~ to view available jobs.", 3f);

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
        #endregion

        #region Global Methods
        private static void startTruckerJob(Player player)
        {
            uiHandling.resetMutationPusher(player, MutationKeys.TruckerJobs);

            AvailableJobs.availableJobs.ForEach(job =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.TruckerJobs, job);
            });

            uiHandling.pushRouterToClient(player, Browsers.TruckerViewUI);
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:handleTruckerJobRequest")]
        private void handleTruckerJob(Player player, int truckerJobId)
        {
            if (!player.checkIsWithinCoord(truckerJobStart, 2f)) return;
               
            Console.WriteLine("Request job " + truckerJobId);
        }
        #endregion

    }
}
