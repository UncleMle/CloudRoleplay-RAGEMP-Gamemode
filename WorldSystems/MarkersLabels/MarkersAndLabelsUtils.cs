using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.MarkersLabels
{
    public class ClientBlip
    {
        public int blipId {  get; set; }
        public Vector3 pos { get; set; }
        public int type { get; set; }
        public int colour { get; set; }
        public string name { get; set; }
        public bool setMarker { get; set; }
    }   
}
