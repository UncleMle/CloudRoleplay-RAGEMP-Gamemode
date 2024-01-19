using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.TruckerJob
{
    public class AvailableJobTrucker
    {
        public int jobId { get; set; }
        public string jobName { get; set; }
        public string image { get; set; }
        public TruckJobTypes jobTypes { get; set; }
        public int jobPay {  get; set; }
    }

    public enum TruckJobTypes
    {
        DealerVehicles,
        Gravel,
        Petrol,
        WheatPlants
    }
}
