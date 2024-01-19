using GTANetworkAPI;
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
                jobPay = 4000,
                loadingPosition = new Vector3(-15.1, -1102.1, 26.7),
                destinationPosition = new Vector3(-357.0, 6072.7, 31.5),
                vehicleTrailer = "tr4"
            },
        };

    }
}
