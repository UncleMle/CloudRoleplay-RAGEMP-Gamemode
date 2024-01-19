using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class AvailableJobTrucker
    {
        public int jobId { get; set; }
        public int estimatedTime { get; set; }
        public string destinationName { get; set; }
        public string jobName { get; set; }
        public string image { get; set; }
        public TruckJobTypes jobTypes { get; set; }
        public int jobPay {  get; set; }
        public Vector3 loadingPosition { get; set; }
        public Vector3 destinationPosition { get; set; }
        public string vehicleTrailer { get; set; }
    }

    public class TruckerJobVehicleData
    {
        public Vector3 loadingPosition { get; set; }
        public Vector3 destinationPosition { get; set; }
        public int jobId { get; set; }
    }

    public enum TruckJobTypes
    {
        DealerVehicles,
        Gravel,
        Petrol,
        WheatPlants
    }
}
