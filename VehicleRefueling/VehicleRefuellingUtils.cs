using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleRefueling
{
    public class RefuelStation
    {
        public int station_id {  get; set; }
        public string name { get; set; }
        public Vector3 position { get; set; }
        public List<RefuelPump> pumps { get; set; }
    }

    public class RefuelPump
    {
        public Vector3 position { get; set; }
        public int owner_id { get; set; }
    }

}
