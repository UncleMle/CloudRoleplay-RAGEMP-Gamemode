using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleInsurance
{
    public class InsuranceArea
    {
        public int insuranceId { get; set; }
        public string insuranceName { get; set; }
        public Vector3 spawnPosition { get; set; }
        public Vector3 retrievePosition { get; set; }
        public int retrieveFee { get; set; }
    }
}
