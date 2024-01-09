using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public class PlayerDealerVehPositions
    {
        public static List<DealerVehPos> dealerVehPositions = new List<DealerVehPos>()
        {
            new DealerVehPos
            {
                ownerId = 0,
                spotId = 0,
                vehPos = new Vector3(-40.5, -2101.2, 16.7),
                vehRot = -160.5
            },
            new DealerVehPos
            {
                ownerId = 0,
                spotId = 1,
                vehPos = new Vector3(-44.1, -2102.4, 16.7),
                vehRot = -160.5
            },
            new DealerVehPos
            {
                ownerId = 0,
                spotId = 2,
                vehPos = new Vector3(-47.4, -2103.7, 16.7),
                vehRot = -156.8
            }
        };

    }
}
