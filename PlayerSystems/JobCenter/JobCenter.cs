using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.JobCenter
{
    public class JobCenter : Script
    {
        public static readonly Vector3 jobCenterPosition = new Vector3(-1153.1, -797.6, 15.5);

        public JobCenter()
        {
            NAPI.Blip.CreateBlip(408, jobCenterPosition, 1f, 4, "Job Center", 255, 1f, true, 0, 0);

            MarkersAndLabels.setPlaceMarker(jobCenterPosition);
            MarkersAndLabels.setTextLabel(jobCenterPosition, "Job Center\nUse ~y~Y~w~ to interact", 5f);
        }
    }
}
