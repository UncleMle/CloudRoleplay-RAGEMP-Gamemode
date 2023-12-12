using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleParking
{
    public class ParkingLot
    {
        public string name { get; set; }
        public RetrieveCol retrieve { get; set; }
        public ParkCol park { get; set; }
        public int parkingId { get; set; }
        public float parkPosRange { get; set; }
        public float retrievePosRange { get; set; }
    }

    public class ParkCol
    {
        public string name { get; set; }
        public int owner_id { get; set; }
        public Vector3 position { get; set; }
    }
    
    public class RetrieveCol
    {
        public string name { get; set; }
        public int owner_id { get; set; }
        public Vector3 position { get; set; }
    }
}
