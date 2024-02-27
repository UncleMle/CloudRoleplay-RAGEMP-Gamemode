using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.WorldSystems.TollBooths
{
    public class TollBoothSystem : Script
    {
        public static readonly string tollBoothBarrierProp = "prop_sec_barrier_ld_02a";
        public static readonly string tollBoothProp = "prop_tollbooth_1";
        public static readonly string tollBoothSharedDataKey = "server:tollBooths:sharedDataKey";

        public TollBoothSystem()
        {
            TollBooths.tollBooths.ForEach(booth =>
            {
                NAPI.Blip.CreateBlip(1, booth.boothPos, 1f, 4, "Toll Booth", 255, 1f, true, 0, 0);

                NAPI.Object.CreateObject(NAPI.Util.GetHashKey(tollBoothProp), booth.boothPos, new Vector3(0, 0, booth.boothRot), 255, 0);
                booth.barrierObject = NAPI.Object.CreateObject(NAPI.Util.GetHashKey(tollBoothBarrierProp), booth.boothBarrierPos, new Vector3(0, 0, booth.boothBarrierRot), 255, 0);

                booth.barrierObject.SetSharedData(tollBoothSharedDataKey, booth);
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"Loaded in {TollBooths.tollBooths.Count} toll booths.");
        }

        [Command("barr")]
        public void barrierCommand(Player player, int barrierId)
        {
            if (TollBooths.tollBooths.ElementAt(barrierId) == null) return;

            TollBooths.tollBooths[barrierId].isBoothActivated = !TollBooths.tollBooths[barrierId].isBoothActivated;

            TollBooths.tollBooths[barrierId].barrierObject.SetSharedData(tollBoothSharedDataKey, TollBooths.tollBooths[barrierId]);

            player.SendChatMessage($"{TollBooths.tollBooths[barrierId].isBoothActivated} barrier.");
        }

    }
}
