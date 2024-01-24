using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.GruppeSixJob
{
    public class GruppeSixJob : Script
    {
        private static readonly Vector3 jobStartPosition = new Vector3(-195.4, -835.3, 30.7);

        public GruppeSixJob()
        {
            NAPI.Blip.CreateBlip(67, jobStartPosition, 1f, 2, "Gruppe Six", 255, 5f, true, 0, 0);
        }

    }
}
