using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Character
{
    public class DbCharacter : BaseEntity
    {
        [Key]
        public int character_id { get; set; }

        [Required]
        public int owner_id { get; set; }

        [Required]
        public string character_name { get; set; }

        [Required]
        public float position_x { get; set; }

        [Required]
        public float position_y { get; set; }

        [Required]
        public float position_z { get; set; }

        [Required]
        public DateTime last_login { get; set; }

        [Required]
        public int character_health { get; set; }

        [Required]
        public int character_isbanned {  get; set; }

        [Required]
        public int money_amount { get; set; }

        public int play_time_minutes { get; set; }

    }

}
