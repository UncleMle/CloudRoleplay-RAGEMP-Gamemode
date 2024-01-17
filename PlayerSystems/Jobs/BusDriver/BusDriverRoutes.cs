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
                    new Stop
                    {
                        stopName = "Sinner Street",
                        stopPos = new Vector3(402.8, -781.5, 29.2)
                    },
                    new Stop
                    {
                        stopName = "Adams Apple Blvd",
                        stopPos = new Vector3(438.3, -1135.7, 29.3)
                    },
                    new Stop
                    {
                        stopName = "Rancho Impound",
                        stopPos = new Vector3(412.0, -1672.5, 29.2)
                    },
                    new Stop
                    {
                        stopName = "Dutch London Street",
                        stopPos = new Vector3(-254.9, -2118.4, 22.1)
                    },
                    new Stop
                    {
                        stopName = "Dutch London Street",
                        stopPos = new Vector3(-254.9, -2118.4, 22.1)
                    },
                    new Stop
                    {
                        stopName = "Davis Avenue",
                        stopPos = new Vector3(-38.1, 1721.9, 29.2)
                    },
                    new Stop
                    {
                        stopName = "Central Medical Center",
                        stopPos = new Vector3(281.2, -1551.3, 29.0)
                    },
                    new Stop
                    {
                        stopName = "Calais Avenue",
                        stopPos = new Vector3(-528.9, -1019.0, 22.8)
                    },
                    new Stop
                    {
                        stopName = "Ginger Street",
                        stopPos = new Vector3(-741.2, -752.1, 26.7)
                    },
                }
            },
        };

        public static Dictionary<float, Vector3> customBusStops = new Dictionary<float, Vector3>
        {
            {
                92.538826f, new Vector3(398.77945, -781.9548, 28.291557)
            },
            {
                -179.34682f, new Vector3(439.2462, -1139.866, 28.418701)
            },
            {
                50.689987f, new Vector3(408.98798, -1670.1643, 28.275072)
            }
        };
    }
}
