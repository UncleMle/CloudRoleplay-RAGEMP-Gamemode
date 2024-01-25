using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class AvailableJobs
    {
        public static List<AvailablePostalJob> availablePostalJobs = new List<AvailablePostalJob>
        {
            new AvailablePostalJob
            {
                description = "Drive a route around the LS Hills delivering packages.",
                jobId = 1,
                jobPay = 4000,
                name = "LS Hills Route",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(373.9, 427.9, 145.7),
                    new Vector3(318.6, 552.1, 156.0)
                }
            }
        };

    }
}
