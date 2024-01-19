using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class AvailableJobs
    {
        public static List<AvailableJobTrucker> availableJobs = new List<AvailableJobTrucker>
        {
            new AvailableJobTrucker
            {
                jobName = "Dealership Vehicles",
                jobTypes = TruckJobTypes.DealerVehicles,
                image = "fleet",
                jobPay = 4000
            }
        };

    }
}
