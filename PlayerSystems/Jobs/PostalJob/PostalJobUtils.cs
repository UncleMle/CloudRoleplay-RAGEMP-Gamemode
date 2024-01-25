using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class AvailablePostalJob
    {
        public int jobId { get; set; }
        public string name {  get; set; }
        public string description { get; set; }
        public int jobPay {  get; set; }
        public List<Vector3> deliveryStops { get; set; }
    }

    public class PostalJobData
    {
        public AvailablePostalJob selectedJob { get; set; }
        public int selectedJobLevel { get; set; }
        public bool hasPackage { get; set; }
    }
}
