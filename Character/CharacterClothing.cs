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

        /*
         * For some reason the default C# .Equals method doesn't work on this object so it must be written manually. 
        */

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType())
            {
                return false;
            }

            CharacterClothing other = (CharacterClothing)obj;

            return
                clothing_id == other.clothing_id &&
                character_id == other.character_id &&
                mask == other.mask &&
                mask_texture == other.mask_texture &&
                torso == other.torso &&
                torso_texture == other.torso_texture &&
                leg == other.leg &&
                leg_texture == other.leg_texture &&
                bags == other.bags &&
                bag_texture == other.bag_texture &&
                shoes == other.shoes &&
                shoes_texture == other.shoes_texture &&
                access == other.access &&
                access_texture == other.access_texture &&
                undershirt == other.undershirt &&
                undershirt_texture == other.undershirt_texture &&
                armor == other.armor &&
                armor_texture == other.armor_texture &&
                decals == other.decals &&
                decals_texture == other.decals_texture &&
                top == other.top &&
                top_texture == other.top_texture;
        }
    }
}
