using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.LawnMowerJob
{
    public class LawnMowerJob : Script
    {
        public static List<Vector3> startPositions = new List<Vector3>
        {
            new Vector3(-1353.6, 140.7, 56.3),
            new Vector3(1825.3, 4944.3, 46.0)
        };

        public LawnMowerJob()
        {
            startPositions.ForEach(start =>
            {
                NAPI.Blip.CreateBlip(351, start, 1f, 2, "Lawn Mower Job", 255, 0, true, 0, 0);

                MarkersAndLabels.setPlaceMarker(start);
                MarkersAndLabels.setTextLabel(start, "Lawn Mower Job\nUse ~y~Y~w~ to interact.", 2f);
            });
        }

    }
}
