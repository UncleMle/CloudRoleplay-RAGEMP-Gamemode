using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.WorldSystems.RaycastInteractions
{
    public class RaycastInteractionSystem : Script
    {
        public static List<RaycastInteraction> raycastPoints = new List<RaycastInteraction>();
        private static readonly string pedRaycastSharedKey = "server:raycastMenuSystems:pedKey";
        private static float maxInteractionDist = 2.5f;

        public RaycastInteractionSystem()
        {
            Main.playerConnect += resyncPlayerInteractionPoints;

            Main.resourceStart += () =>
            {
                NAPI.Task.Run(() =>
                {
                    ChatUtils.formatConsolePrint($"Loaded {raycastPoints.Count} raycast interaction points", ConsoleColor.Green);

                    raycastPoints.ForEach(p =>
                    {
                        Ped rayPed = NAPI.Ped.CreatePed((uint)PedHash.Hacker, p.raycastMenuPosition, 0, true, true, true, true, 0);

                        rayPed.SetSharedData(pedRaycastSharedKey, raycastPoints.IndexOf(p));

                        if(p.hasPlaceMarker) MarkersAndLabels.setPlaceMarker(p.raycastMenuPosition);
                    });
                }, 6 * 1000);
            };
        }

        #region Global Methods

        public static void resyncPlayerInteractionPoints(Player player)
        {
            List<RaycastInteractionClient> points = new List<RaycastInteractionClient>();

            raycastPoints.ForEach(p =>
            {
                points.Add(new RaycastInteractionClient { menuTitle = p.menuTitle, raycastMenuItems = p.raycastMenuItems, raycastMenuPosition = p.raycastMenuPosition });
            });

            player.TriggerEvent("client::raycastInteractions:loadPoints", JsonConvert.SerializeObject(points));
        }

        public static void updateRaycastPointInteractionMenu(RaycastInteraction point, List<string> menuOptions)
        {
            int index = raycastPoints.IndexOf(point);

            if (index == -1) return;

            point.raycastMenuItems = menuOptions;

            raycastPoints[index] = point;

            NAPI.Pools.GetAllPlayers().ForEach(p => loadOnePoint(p, index, point));
        }

        public static void loadOnePoint(Player player, int idx, RaycastInteraction raypoint) 
            => player.TriggerEvent("client::raycastInteractions:loadOnePoint", JsonConvert.SerializeObject(
                new RaycastInteractionClient { menuTitle = raypoint.menuTitle, raycastMenuItems = raypoint.raycastMenuItems, raycastMenuPosition = raypoint.raycastMenuPosition }
                ), idx);

        public static void addOnePoint(Player player, RaycastInteraction point, int idx)
            => player.TriggerEvent("client::raycastInteractions:addOnePoint", JsonConvert.SerializeObject(
                new RaycastInteractionClient { menuTitle = point.menuTitle, raycastMenuItems = point.raycastMenuItems, raycastMenuPosition = point.raycastMenuPosition }
                ), idx);

        #endregion

        #region Remote Events
        [RemoteEvent("server:raycastInteractions:pointInteraction")]
        public void handleRaycastInteraction(Player player, int interactionId, string raycastOption)
        {
            if (raycastPoints.ElementAtOrDefault(interactionId) == null) return;

            RaycastInteraction interaction = raycastPoints[interactionId];

            if (Vector3.Distance(player.Position, interaction.raycastMenuPosition) > maxInteractionDist) return;

            interaction.targetMethod.Invoke(player, raycastOption);
        }
        #endregion
    }
}
