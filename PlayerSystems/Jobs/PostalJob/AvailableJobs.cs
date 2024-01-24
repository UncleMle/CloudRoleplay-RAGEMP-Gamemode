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
                name = "LS Hills"
            }
        };

    }
}
