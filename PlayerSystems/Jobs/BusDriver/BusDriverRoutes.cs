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
                routePay = 6500,
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
                        stopPos = new Vector3(576.7, 2697.4, 41.9)
                    },
                    new Stop
                    {
                        stopName = "Zancudo Military Center", 
                        stopPos = new Vector3(-2460.6, 3707.0, 15.1)
                    },
                }
            },
            new BusRoute
            {
                routeName = "67 Route",
                ownerDepoId = 0,
                routePay = 6500,
                stops = new List<Stop> {
                    new Stop {
                        stopName = "Paleto Blvd", 
                        stopPos =  new Vector3(-17.0, 6508.4, 31.3)
                    },
                    new Stop {
                        stopName = "Grapeseed Main Street", 
                        stopPos = new Vector3(1659.2, 4889.8, 42.1)
                    },
                    new Stop
                    {
                        stopName = "Seaview Road", 
                        stopPos = new Vector3(2308.9, 4722.4, 36.9)
                    },
                    new Stop
                    {
                        stopName = "Sandy Shores", 
                        stopPos = new Vector3(1877.1, 3680.5, 33.5)
                    },
                    new Stop
                    {
                        stopName = "Route 68 - Harmony",
                        stopPos = new Vector3(627.9, 2694.2, 41.1)
                    },
                }
            },
            new BusRoute
            {
                routeName = "39 Route",
                ownerDepoId = 1,
                routePay = 2500,
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
                        stopName = "Davis Avenue",
                        stopPos = new Vector3(-38.1, -1721.9, 29.2)
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
                    new Stop
                    {
                        stopName = "Rockford Plaza",
                        stopPos = new Vector3(-152.9, -405.7, 33.6)
                    }
                }
            }, new BusRoute
            {
                routeName = "AX1 Route",
                ownerDepoId = 1,
                routePay = 3500,
                stops = new List<Stop> {
                    new Stop
                    {
                        stopName = "Strawbery Avenue",
                        stopPos = new Vector3(307.7, -766.4, 29.3)
                    },
                    new Stop
                    {
                        stopName = "Strawbery Avenue - Grove Street",
                        stopPos = new Vector3(-107.3, -1687.9, 29.3)
                    },
                    new Stop
                    {
                        stopName = "LSIA Terminal One",
                        stopPos = new Vector3(-1001.4, -2457.6, 13.7)
                    },
                    new Stop
                    {
                        stopName = "LSIA Terminal Four",
                        stopPos = new Vector3(-1041.7, -2717.3, 13.7)
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
            },
            {
                6.2055545f, new Vector3(576.05524, 2700.5852, 40.774445)
            },
            {
                -93.16252f, new Vector3(-2456.6465, 3707.7903, 13.123082)
            },
            {
                -133.6649f, new Vector3(-13.145284, 6505.5225, 30.543692)
            },
            {
                100.13624f, new Vector3(1656.4304, 4888.5146, 41.03573)
            },
            {
                -14.7818595f, new Vector3(2309.115, 4725.4043, 35.87122)
            },
            {
                34.847706f, new Vector3(1875.5444, 3684.026, 32.4415)
            },
            {
                -165.03435f, new Vector3(628.558, 2691.1338, 39.93007)
            },
            {
                -106.39784f, new Vector3(-149.38226, -405.5581, 32.730766)
            },
            {
                61.776722f, new Vector3(-1004.15344, -2456.655, 12.771277)
            }
        };
    }
}
