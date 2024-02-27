using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.VehicleSystems.VehicleGarages
{
    public class VehicleGarage
    {
        [Key]
        public int garage_id { get; set; }

        [Required]
        public int garage_owner_id { get; set; }
        public int vehicle_slots { get; set; } = 1;
        public float pos_x { get; set; }
        public float pos_y { get; set; }
        public float pos_z { get; set; }
        public int garage_sell_price { get; set; }
    }
}
