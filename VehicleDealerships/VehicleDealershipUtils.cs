using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleDealerships
{
    public class DealerShip
    {
        public int dealerShipId { get; set; }
        public Vector3 position { get; set; }
        public Vector3 spawnPosition { get; set; }
        public Vector3 viewPosition { get; set; }
        public string dealershipName { get; set; }
        public List<DealerVehicle> vehicles { get; set; }
        public float viewRange { get; set; }    
        public bool activeForPlayer { get; set; }    
    }

    public class DealerVehicle
    {
        public string spawnName { get; set; }
        public int price { get; set; }
    }
}
