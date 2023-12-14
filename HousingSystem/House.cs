using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CloudRP.HousingSystem
{
    public class House : BaseEntity 
    {
        [Key]
        public int house_id { get; set; }

        [Required]
        public int house_owner_id { get; set; }
        public string house_name { get; set; }
        public float house_position_x { get; set; }
        public float house_position_y { get; set; }
        public float house_position_z { get; set; }
        public int house_interior_id {  get; set; } 
        public int house_price { get; set; }
        public int garage_size { get; set; }
        public bool blip_visible { get; set; }

        [NotMapped]
        public ColShape interiorExitCol {  get; set; }
        [NotMapped]
        public bool isLocked { get; set; }
        [NotMapped]
        public ColShape houseCol { get; set; }
        [NotMapped]
        public TextLabel houseLabel { get; set; }
        [NotMapped]
        public TextLabel priceLabel { get; set; }       
        [NotMapped]
        public Marker houseMarker { get; set; }
        [NotMapped]
        public Blip houseBlip { get; set; }
        [NotMapped]
        public List<Player> playersInHouse { get; set; } = new List<Player>();
    }
}
