using CloudRP.GeneralSystems.SpeedCameras;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.WorldSystems.NpcInteractions
{
    public class NpcInteractions : Script
    {
        public static readonly string _npcPedSharedDataKey = "npcs:peds:sharedDataKey";
        public static List<InteractionPed> npcPeds = new List<InteractionPed>();
        public static float maxNpcDist = 4.0f;

        public NpcInteractions()
        {
            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {npcPeds.Count} npc interaction points were loaded.");
        }

        #region Global Methods
        public static int buildPed(PedHash ped, Vector3 position, float heading, string headName, string[] raycastMenuItems, Action<Player, string> targetMethod)
        {
            Ped npcPed = NAPI.Ped.CreatePed((uint)ped, position, heading, false, true, true, true, 0);

            InteractionPed interactionPed = new InteractionPed
            {
                ped = npcPed,
                pedHeadName = headName,
                raycastMenuItems = raycastMenuItems,
                targetMethod = targetMethod
            };

            npcPed.SetSharedData(_npcPedSharedDataKey, new InteractionPedShared
            {
                ped = npcPed,
                pedHeadName = headName,
                raycastMenuItems = raycastMenuItems,
            });

            npcPeds.Add(interactionPed);

            return npcPed.Id;
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:npcPeds:recieveInteraction")]
        public void handleNpcInteraction(Player player, string raycastMenu)
        {
            InteractionPed targetPed = npcPeds
                .OrderBy(item => Vector3.Distance(player.Position, item.ped.Position)).First();

            if (targetPed == null || Vector3.Distance(player.Position, targetPed.ped.Position) > maxNpcDist) return;

            targetPed.targetMethod(player, raycastMenu);
        }
        #endregion
    }
}
