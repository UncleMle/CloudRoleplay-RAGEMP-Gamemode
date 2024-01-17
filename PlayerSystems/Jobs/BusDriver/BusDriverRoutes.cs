using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverRoutes
    {
        public static List<BusRoute> busRoutes = new List<BusRoute>
        {
            new BusRoute
            {
                routeName = "84 Route",
                ownerDepoId = 0,
                routePay = 1500,
                stops = new List<Stop> {
                    new Stop {
                        stopName = "Great Ocean HWY", 
                        stopPos =  new Vector3(-152.5, 6212.0, 31.2)
                    },
                    new Stop {
                        stopName = "Union Rd", 
                        stopPos = new Vector3(2891.8, 4432.5, 48.3)
                    },
                    new Stop
                    {
                        stopName = "Route 68 - Harmony", 
                        stopPos = new Vector3(624.6, 2704.7, 41.0)
                    },
                }
            },
            new BusRoute
            {
                routeName = "54 Route",
                ownerDepoId = 0,
                routePay = 4000,
                stops = new List<Stop> {
                    new Stop {
                        stopName = "Great Ocean HWY", 
                        stopPos =  new Vector3(-152.5, 6212.0, 31.2)
                    },
                    new Stop {
                        stopName = "Union Rd", 
                        stopPos = new Vector3(2891.8, 4432.5, 48.3)
                    },
                    new Stop
                    {
                        stopName = "Route 68 - Harmony", 
                        stopPos = new Vector3(624.6, 2704.7, 41.0)
                    },
                }
            },
            new BusRoute
            {
                routeName = "39 Route",
                ownerDepoId = 1,
                routePay = 1500,
                stops = new List<Stop> {
                    new Stop {
                        stopName = "Great Ocean HWY", 
                        stopPos =  new Vector3(-152.5, 6212.0, 31.2)
                    },
                    new Stop {
                        stopName = "Union Rd", 
                        stopPos = new Vector3(2891.8, 4432.5, 48.3)
                    },
                    new Stop
                    {
                        stopName = "Route 68 - Harmony", 
                        stopPos = new Vector3(624.6, 2704.7, 41.0)
                    },
                }
            },
        };

    }
}
