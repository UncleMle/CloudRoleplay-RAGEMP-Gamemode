using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.BusDriver
{
    public class BusDriverJob
    {
        public static List<BusDepo> busDepos = new List<BusDepo>
        {
            new BusDepo
            {
                depoId = 0,
                depoName = "Duluoz Bus Depot",
                depoStartPosition = new Vector3(-236.6, 6202.3, 31.9)
            }
        };

    }
}
