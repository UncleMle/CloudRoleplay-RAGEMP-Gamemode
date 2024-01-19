using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class TruckerSpawns
    {
        public static List<TruckerSpawnPosition> truckerSpawnPositions = new List<TruckerSpawnPosition>
        {
            new TruckerSpawnPosition {
                rotation = -143.3f,
                position = new Vector3(-534.9, -2836.8, 6.0)
            },
            new TruckerSpawnPosition {
                rotation = -143.3f,
                position = new Vector3(-529.2, -2832.1, 6.0)
            },
            new TruckerSpawnPosition {
                rotation = -143.3f,
                position = new Vector3(-525.0, -2828.5, 6.0)
            },
            new TruckerSpawnPosition {
                rotation = -143.3f,
                position = new Vector3(-520.8, -2823.1, 6.0)
            },
            new TruckerSpawnPosition {
                rotation = -143.3f,
                position = new Vector3(-516.0, -2818.7, 6.0)
            }
        };
    }

    public class TruckerSpawnPosition
    {
        public float rotation;
        public Vector3 position;
    }
}
