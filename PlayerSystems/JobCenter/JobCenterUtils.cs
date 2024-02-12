using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.JobCenter
{
    public class JobCenterViewJob
    {
        public string jobName { get; set; }
        public string jobDescription { get; set; }
        public int averagePay { get; set; }
        public List<Vector3> jobPositions { get; set; } 
    }
}
