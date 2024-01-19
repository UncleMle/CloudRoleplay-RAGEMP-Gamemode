using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerSpawns
    {
        public static Dictionary<float, Vector3> truckerSpawnPositions = new Dictionary<float, Vector3>
        {
            {
                44.9f, new Vector3(-446.4, -2788.9, 6.0)
            },
            {
                43.0f, new Vector3(-450.9, -2793.9, -450.9)
            },
            {
                46.0f, new Vector3(-456.5, -2797.5, 6.0)
            },
            {
                45.3f, new Vector3(-461.2, -2801.7, 6.0)
            },
            {
                47.1f, new Vector3(-465.5, -2806.2, 6.0)
            },
            {
                48.0f, new Vector3(-470.0, -2810.8, 6.0)
            }
        };

    }
}
