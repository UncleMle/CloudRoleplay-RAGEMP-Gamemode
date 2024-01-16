using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverRoutes
    {
        public List<BusRoute> busRoutes = new List<BusRoute>
        {
            new BusRoute
            {
                routeName = "",
                stops = new Dictionary<string, Vector3> {
                    
                }
            }
        };

    }
}
