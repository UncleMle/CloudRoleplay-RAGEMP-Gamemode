using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.RentableVehicles
{
    public class RentableVehiclePoint
    {
        public int rentPrice { get; set; }
        public Vector3 npcSpawn { get; set; }
        public float npcHeading { get; set; }
        public PedHash npcPed { get; set; }
        public int npcId { get; set; }
        public Vector3 spawnVehicles { get; set; }
    }

    public class PhoneUiData
    {
        public string vehicleDisplay { get; set; }
        public Vector3 position { get; set; }
    }

    public class RentVehicleData
    {
        public string vehicleDisplay { get; set; }
        public int characterOwnerId { get; set; }
    }
}
