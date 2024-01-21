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
                vehicleTrailer = "tr2"
            },
            new AvailableJobTrucker
            {
                jobName = "Hay Bales",
                jobTypes = TruckJobTypes.HayBales,
                estimatedTime = 10,
                destinationName = "Paleto - Farm",
                image = "hay-bale",
                jobPay = 3440,
                loadingPosition = new Vector3(-347.4, -2637.1, 6.0),
                destinationPosition = new Vector3(410.2, 6474.7, 28.8),
                vehicleTrailer = "baletrailer"
            },
            new AvailableJobTrucker
            {
                jobName = "Gravel",
                jobTypes = TruckJobTypes.Gravel,
                estimatedTime = 10,
                destinationName = "Grapeseed - Farm",
                image = "gravel",
                jobPay = 4240,
                loadingPosition = new Vector3(-347.4, -2637.1, 6.0),
                destinationPosition = new Vector3(2101.9, 4744.6, 41.2),
                vehicleTrailer = "graintrailer"
            },
        };

    }
}
