using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Character
{
    public class CharacterClothing : BaseEntity
    {
        [Key]
        public int clothing_id { get; set; }

        [Required]
        public int character_id { get; set; } 

        public int mask { get; set; }
        public int mask_texture { get; set; }
        public int torso { get; set; }
        public int torso_texture { get; set; }
        public int leg { get; set; }
        public int leg_texture { get; set; }
        public int bags { get; set; }
        public int bag_texture { get; set; }
        public int shoes { get; set; }
        public int shoes_texture { get; set; }
        public int access { get; set; }
        public int access_texture { get; set; }
        public int undershirt { get; set; }
        public int undershirt_texture { get; set; }
        public int armor { get; set; }
        public int armor_texture { get; set; }
        public int decals { get; set; }
        public int decals_texture { get; set; }
        public int top { get; set; }
        public int top_texture { get; set; }
    }
}
