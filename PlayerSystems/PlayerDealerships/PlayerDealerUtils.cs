using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public class Dealer
    {
        public Vector3 sellVehPos {  get; set; }
        public float taxRate { get; set; }
        public int dealerId { get; set; }
        public List<DealerVehPos> vehiclePositions { get; set; }
    }

    public class DealerVehPos
    {
        public Vector3 vehPos { get; set;}
        public double vehRot { get; set;}
        public int ownerId { get; set;}
        public int spotId { get; set;}
        public DbVehicle vehInSpot { get; set; }
    }
}
