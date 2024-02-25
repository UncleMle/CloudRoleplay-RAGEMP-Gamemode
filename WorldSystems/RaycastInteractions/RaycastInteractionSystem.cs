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
        private static float maxInteractionDist = 4.5f;

        public RaycastInteractionSystem()
        {
            Main.playerConnect += resyncPlayerInteractionPoints;

            Main.resourceStart += () =>
            {
                ChatUtils.formatConsolePrint($"Loaded {raycastPoints.Count} raycast interaction points", ConsoleColor.Green);

                raycastPoints.ForEach(p => MarkersAndLabels.setPlaceMarker(p.raycastMenuPosition));
            };
        }

        #region Global Methods

        private void resyncPlayerInteractionPoints(Player player)
        {
            List<RaycastInteractionClient> points = new List<RaycastInteractionClient>();

            raycastPoints.ForEach(p =>
            {
                points.Add(new RaycastInteractionClient { raycastMenuItems = p.raycastMenuItems, raycastMenuPosition = p.raycastMenuPosition });
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
