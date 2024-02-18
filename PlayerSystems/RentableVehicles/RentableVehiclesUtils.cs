using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.RentableVehicles
{
    public class RentableVehiclePoint
    {
        public int rentPrice { get; set; }
        public Vector3 rentStartPos { get; set; }
        public Vector3 rentEndPos { get; set; }
        public Vector3 npcSpawn { get; set; }
        public float npcHeading { get; set; }
        public PedHash npcPed { get; set; }
        public int npcId { get; set; }
    }
}
