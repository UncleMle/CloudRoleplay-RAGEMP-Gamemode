using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.PlayerSystems.Character
{
    public class Tattoo : BaseEntity
    {
        [Key]
        public int tattoo_id { get; set; }

        [Required]
        public int tattoo_owner_id { get; set; }

        public string tattoo_lib { get; set; }
        public string tattoo_collection { get; set; }
    }
}
