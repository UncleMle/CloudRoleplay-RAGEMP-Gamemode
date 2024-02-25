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
        private static float maxInteractionDist = 4.5f;

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

                        MarkersAndLabels.setPlaceMarker(p.raycastMenuPosition);
                    });
                }, 6 * 1000);
            };
        }

        #region Global Methods

        private void resyncPlayerInteractionPoints(Player player)
        {
            List<RaycastInteractionClient> points = new List<RaycastInteractionClient>();

            raycastPoints.ForEach(p =>
            {
                points.Add(new RaycastInteractionClient { menuTitle = p.menuTitle, raycastMenuItems = p.raycastMenuItems, raycastMenuPosition = p.raycastMenuPosition });
            });

            player.TriggerEvent("client::raycastInteractions:loadPoints", JsonConvert.SerializeObject(points));
        }
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
