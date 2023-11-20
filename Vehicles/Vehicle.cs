using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Vehicles
{
    public class Vehicle : BaseEntity
    {
        [Key]
        public int vehicle_id { get; set; }

        [Required]
        public int owner_id { get; set; }

        [Required]
        public string vehicle_name { get; set; }

        [Required]
        public string vehicle_spawn_name { get; set; }

    }
}
