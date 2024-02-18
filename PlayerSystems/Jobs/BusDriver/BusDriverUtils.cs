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
        public float busStartRotation { get; set; }
        public Vector3 busStartPosition { get; set; }
        public List<string> buses { get; set; } = new List<string>();
        public Vector3 npcPosition { get; set; }
        public float npcHeading { get; set; }
    }

    public class BusRoute
    {
        public int routeId { get; set; }
        public int ownerDepoId { get; set; }
        public string routeName { get; set; }
        public List<Stop> stops { get; set; } = new List<Stop>();
        public int routePay { get; set; }
    }

    public class Stop
    {
        public string stopName { get; set; }
        public Vector3 stopPos { get; set; }
    }

    public class BusSharedData
    {
        public string destination { get; set; }
        public string nextStop { get; set; }
    }
}
