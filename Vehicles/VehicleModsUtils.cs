using System;
using System.Collections.Generic;
using System.Text;
using GTANetworkAPI;

namespace CloudRP.Vehicles
{
    public class CustomArea
    {
        public string name { get; set; }
        public int custom_id { get; set; }
        public Vector3 startVec { get; set; }
        public Vector3 endVec { get; set; }
    }
}
