using CloudRP.Vehicles;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PhoneSystem
{
    public class PhoneUiVeh
    {
        public string vehicle_name { get; set; }
        public string numberplate {  get; set; }
        public double vehicle_fuel { get; set; }
        public double vehicle_distance { get; set; }
        public float position_x { get; set; }
        public float position_y { get; set; }
        public float position_z { get; set; }
        public string vehicle_dimension { get; set; }
        public int vehicle_insurance_id { get; set; }
        public int vehicle_garage_id { get; set; }
        public int vehicle_id { get; set; }
        public List<VehicleKey> vehicle_key_holders { get; set; } = new List<VehicleKey>();
    }
}
