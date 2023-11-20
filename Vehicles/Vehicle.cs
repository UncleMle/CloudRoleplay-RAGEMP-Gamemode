using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Numerics;

namespace CloudRP.Vehicles
{
    public class DbVehicle : BaseEntity
    {
        [Key]
        public int vehicle_id { get; set; }

        [Required]
        public int owner_id { get; set; }

        [Required]
        public string vehicle_name { get; set; }

        public uint vehicle_spawn_hash { get; set; }

        [Required]
        public float position_x { get; set; }

        [Required]
        public float position_y { get; set; }

        [Required]
        public float position_z { get; set; }

        [Required]
        public float rotation { get; set;}

    }
}
