using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.GruppeSixJob
{
    public class GruppeSixAvailableJob
    {
        public int jobId { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int jobPay { get; set; }
        public List<Vector3> deliveryStops { get; set; }
    }

    public class GruppeSixJobData
    {
        public bool carryingMoney { get; set; }
        public GruppeSixAvailableJob selectJob { get; set; }
    }
}
