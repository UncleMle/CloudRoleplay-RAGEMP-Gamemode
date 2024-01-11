using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.GeneralSystems.GeneralCommands
{
    public class Nickname : BaseEntity
    {
        [Key]
        public int nickname_id { get; set; }
        [Required]
        public int owner_id { get; set; }
        [Required]
        public int target_character_id { get; set; }
        [Required]
        public string nickname { get; set; }
    }
}
