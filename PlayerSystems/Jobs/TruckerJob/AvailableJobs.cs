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
                estimatedTime = 10,
                destinationName = "Paleto",
                image = "fleet",
                jobPay = 4000
            },
            new AvailableJobTrucker
            {
                jobName = "Wheat Plants",
                jobTypes = TruckJobTypes.WheatPlants,
                image = "wheat-plant",
                estimatedTime = 14,
                destinationName = "LS Docks",
                jobPay = 7500
            }
        };

    }
}
