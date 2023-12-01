using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.AntiCheat
{
    public class CharacterConnection
    {
        [Key]
        public int join_log_id { get; set; }

        [Required]
        public long unix {  get; set; }

        [Required]
        public int connection_type { get; set; }

        [Required]
        public string character_name { get; set; }
        
        [Required]
        public int character_id { get; set; }

        [Required]
        public int player_id { get; set; }
    }
}
