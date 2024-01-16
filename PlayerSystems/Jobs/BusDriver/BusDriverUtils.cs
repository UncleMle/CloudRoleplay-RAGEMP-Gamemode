using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDepo
    {
        public string depoName { get; set; }
        public Vector3 depoStartPosition { get; set; }
        public int depoId { get; set; }
        public double busStartRotation { get; set; }
        public Vector3 busStartPosition { get; set; }
    }

    public class BusRoute
    {
        public int ownerDepoId { get; set; }
        public string routeName { get; set; }
        public List<KeyValuePair<string, Vector3>> stops { get; set; } = new List<KeyValuePair<string, Vector3>>();
        public int routePay { get; set; }
    }
}
