using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Vehicles
{
    public class VehicleMods : BaseEntity
    {
        [Key]
        public int vehicle_mod_id { get; set; }

        [Required]
        public int vehicle_owner_id { get; set; }

        public int spoilers { get; set; } = -1;
        public int front_bumper { get; set; } = -1;
        public int rear_bumper { get; set; } = -1;
        public int side_skirt { get; set; } = -1;
        public int exhaust { get; set; } = -1;
        public int frame { get; set; } = -1;
        public int grille { get; set; } = -1;
        public int hood { get; set; } = -1;
        public int fender { get; set; } = -1; 
        public int right_fender { get; set; } = -1;
        public int roof { get; set; } = -1;
        public int engine { get; set; } = -1;
        public int brakes { get; set; } = -1;
        public int transmission { get; set; } = -1;
        public int horns { get; set; } = -1;
        public int suspension { get; set; } = -1;
        public int armor { get; set; } = -1;
        public int turbo { get; set; } = -1;
        public int xenon { get; set; } = -1;
        public int front_wheels { get; set; } = -1;
        public int back_wheels { get; set; } = -1;
        public int plate_holders { get; set; } = -1;
        public int trim_design { get; set; } = -1;
        public int ornaments { get; set; } = -1;
        public int dial_design { get; set; } = -1;
        public int steering_wheel { get; set; } = -1;
        public int shift_lever { get; set; } = -1;
        public int plaques { get; set; } = -1;
        public int hydraulics { get; set; } = -1;
        public int boost { get; set; } = -1;
        public int window_tint { get; set; } = -1;
        public int livery { get; set; } = -1;
        public int plate { get; set; } = -1;
        public int colour_1 { get; set; } = -1;
        public int colour_2 { get; set; } = -1;
    }
}
