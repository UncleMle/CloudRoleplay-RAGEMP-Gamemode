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
        public delegate void NpcInteractionsEventHandler(Player player, int npcId, string raycastOption);
        public static event NpcInteractionsEventHandler onNpcInteract;

        public static readonly string _npcPedSharedDataKey = "npcs:peds:sharedDataKey";
        public static Dictionary<int, InteractionPed> npcPeds = new Dictionary<int, InteractionPed>();
        public static float maxNpcDist = 4.0f;

        public NpcInteractions()
        {
            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {npcPeds.Count} npc interaction points were loaded.");
        }

        #region Global Methods
        public static int buildPed(PedHash ped, Vector3 position, float heading, string headName, string[] raycastMenuItems)
        {
            Ped npcPed = NAPI.Ped.CreatePed((uint)ped, position, heading, false, true, true, true, 0);

            InteractionPed interactionPed = new InteractionPed
            {
                ped = npcPed,
                pedHeadName = headName,
                raycastMenuItems = raycastMenuItems
            };

            npcPed.SetSharedData(_npcPedSharedDataKey, interactionPed);
            npcPeds.Add(npcPed.Id, interactionPed);

            return npcPed.Id;
        }

        public static int getClosestPedByRange(Player player, float range)
        {
            int pedId = -1;

            foreach (KeyValuePair<int, InteractionPed> npc in npcPeds)
            {
                Vector3 pos = npc.Value.ped.Position;

                if(pos.DistanceToSquared(player.Position) < range) pedId = npc.Key;
            }

            return pedId;
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:npcPeds:recieveInteraction")]
        public void handleNpcInteraction(Player player, string raycastMenu)
        {
            KeyValuePair<int, InteractionPed> targetPed = npcPeds
                .OrderBy(item => Vector3.Distance(player.Position, item.Value.ped.Position)).First();

            if (targetPed.Value == null || Vector3.Distance(player.Position, targetPed.Value.ped.Position) > maxNpcDist) return;

            onNpcInteract(player, targetPed.Value.ped.Id, raycastMenu);
        }
        #endregion
    }
}
