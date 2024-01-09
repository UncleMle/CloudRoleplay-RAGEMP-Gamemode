using System;
using System.Collections.Generic;
using System.Text;
using GTANetworkAPI;

namespace CloudRP.VehicleSystems.VehicleRefueling
{
    public class VehicleRefuelStations
    {
        public static List<RefuelStation> refuelingStations = new List<RefuelStation>
        {
            new RefuelStation
            {
                station_id = 0,
                name = "Mirror Park Gas",
                position = new Vector3(1181.2, -330.1, 74.5),
                pricePerLitre = 2,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1183.2, -321.5, 69.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1175.8, -322.9, 69.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1177.3, -330.4, 69.3)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1184.8, -329.1, 69.3)
                    }
                }
            },
            new RefuelStation
            {
                name = "Del Perro Gas",
                station_id = 1,
                position = new Vector3(-2096.9, -319.1, 17.9),
                pricePerLitre = 6,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2087.8, -312.7, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2095.5, -312.0, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2096.2, -320.1, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2088.8, -321.0, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2096.8, -326.8, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2089.3, -327.3, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2104.0, -311.1, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2104.8, -319.3, 13.2)
                    },
                    new RefuelPump
                    {
                        owner_id = 1,
                        position = new Vector3(-2105.5, -325.7, 13.2)
                    }
                }
            },
            new RefuelStation
            {
                name = "Route 68 Gas",
                station_id = 2,
                position = new Vector3(-2555.2, 2333.5, 43.2),
                pricePerLitre = 8,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump {
                        owner_id = 2,
                        position = new Vector3(-2558.7, 2340.9, 33.3)
                    },
                    new RefuelPump {
                        owner_id = 2,
                        position = new Vector3(-2552.4, 2341.3, 33.3)
                    },
                    new RefuelPump {
                        owner_id = 2,
                        position = new Vector3(-2558.5, 2333.5, 33.3)
                    },
                    new RefuelPump {
                        owner_id = 2,
                        position = new Vector3(-2552.6, 2333.9, 33.3)
                    },
                    new RefuelPump {
                        owner_id = 2,
                        position = new Vector3(-2551.4, 2326.5, 33.3)
                    }
                },
            },
            new RefuelStation
            {
                name = "Popular Street Gas",
                station_id = 3,
                position = new Vector3(819.2, -1028.7, 34.8),
                pricePerLitre = 6,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(811.3, -1031.0, 26.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(811.3, -1026.3, 26.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(819.6, -1026.3, 26.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(819.6, -1030.9, 26.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(827.9, -1031.0, 26.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 3,
                        position = new Vector3(827.9, -1026.3, 26.6)
                    },
                }
            },
            new RefuelStation
            {
                name = "Senora Gas",
                station_id = 4,
                position = new Vector3(1701.9, 6417.4, 38.2),
                pricePerLitre = 12,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 4,
                        position = new Vector3(1705.5, 6414.1, 32.8)
                    },
                    new RefuelPump
                    {
                        owner_id = 4,
                        position = new Vector3(1701.5, 6416.0, 32.8)
                    },
                    new RefuelPump
                    {
                        owner_id = 4,
                        position = new Vector3(1697.5, 6417.8, 32.8)
                    }
                }
            },
            new RefuelStation
            {
                name = "Sandy Gas",
                station_id = 5,
                position = new Vector3(2004.3, 3775.5, 39.6),
                pricePerLitre = 16,
                pumps= new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 5,
                        position = new Vector3(2009.8, 3776.2, 32.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 5,
                        position = new Vector3(2006.6, 3774.4, 32.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 5,
                        position = new Vector3(2004.3, 3772.8, 32.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 5,
                        position = new Vector3(2002.1, 3771.6, 32.4)
                    },
                }
            },
            new RefuelStation
            {
                name = "Palomino Gas",
                station_id = 6,
                position = new Vector3(2582.2, 361.8, 118.6),
                pricePerLitre = 9,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2574.1, 359.2, 108.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2574.4, 364.7, 108.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2581.8, 364.2, 108.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2581.5, 358.8, 108.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2589.0, 358.4, 108.6)
                    },
                    new RefuelPump
                    {
                        owner_id = 6,
                        position = new Vector3(2589.2, 364.0, 108.6)
                    },
                }
            },
            new RefuelStation
            {
                name = "Palomino Gas",
                station_id = 7,
                position = new Vector3(49.4, 2779.0, 62.8),
                pricePerLitre = 15,
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 7,
                        position = new Vector3(49.9, 2777.9, 58.0)
                    },
                    new RefuelPump
                    {
                        owner_id = 7,
                        position = new Vector3(48.5, 2779.0, 58.0)
                    },
                }
            }
        };
    }
}
