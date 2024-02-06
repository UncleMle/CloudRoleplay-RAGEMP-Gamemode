using CloudRP.ServerSystems.Database;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionRank : BaseEntity
    {
        [Key]
        public int faction_rank_id { get; set; }

        [Required]
        public string rank_name { get; set; }
        public int faction_owner_id { get; set; }
        public int rank_salary { get; set; }
        public string rank_permissions { get; set; } = JsonConvert.SerializeObject(new string[] { });
        public string allowed_vehicles { get; set; } = JsonConvert.SerializeObject(new string[] { });
        public string allowed_weapons { get; set; } = JsonConvert.SerializeObject(new string[] { });
        public string allowed_uniforms { get; set; } = JsonConvert.SerializeObject(new string[] { });
    }
}
