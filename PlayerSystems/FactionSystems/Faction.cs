using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class Faction : BaseEntity
    {
        [Key]
        public int faction_id { get; set; }

        [Required]
        public string faction_name { get; set; }
        public int owner_id { get; set; }
        public string faction_allowed_vehicles { get; set; }
    }
}
