using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public class Dealer
    {
        public Vector3 sellVehPos {  get; set; }
        public int dealerId { get; set; }
        public List<Vector3> vehiclePositions { get; set; }
    }
}
