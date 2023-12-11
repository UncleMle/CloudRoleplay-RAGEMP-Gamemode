using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Vehicles
{
    public class VehicleMods : BaseEntity
    {
        [Key]
        public int vehicle_mod_id { get; set; }

        [Required]
        public int vehicle_owner_id { get; set; }
        public int mod_type { get; set; }
        public int mod_index { get; set; }
        public string mod_name { get; set; }
    }
}
