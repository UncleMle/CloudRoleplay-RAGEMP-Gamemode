using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class PostalJob : Script
    {
        private static readonly Vector3 jobStartPosition = new Vector3(-232.1, -914.9, 32.3);

        public PostalJob()
        {
            NAPI.Blip.CreateBlip(837, jobStartPosition, 1f, 62, "Postal OP", 255, 5f, true, 0, 0);
        }

    }
}
