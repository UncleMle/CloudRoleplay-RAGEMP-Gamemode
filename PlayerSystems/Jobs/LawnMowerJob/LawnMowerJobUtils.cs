using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.LawnMowerJob
{
    public class MowableLawn
    {
        public Vector3 startPos { get; set; }
        public int pay { get; set; }
        public List<Vector3> stops { get; set; }
        public List<Vector3> stopsDone { get; set; } = new List<Vector3>();
    }
}
