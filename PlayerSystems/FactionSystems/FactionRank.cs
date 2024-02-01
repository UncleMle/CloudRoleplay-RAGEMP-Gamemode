using CloudRP.ServerSystems.Database;
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
        public int faction_owner_id { get; set; }
        public int rank_salary { get; set; }
        public int rank_permissions { get; set; }
    }
}
