using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;
using GTANetworkAPI;
using CloudRP.VehicleSystems.VehicleModification;
using CloudRP.ServerSystems.Database;

namespace CloudRP.VehicleSystems.Vehicles
{
    public class DbVehicle : BaseEntity
    {
        [Key]
        public int vehicle_id { get; set; }

        public string vehicle_uuid { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public int owner_id { get; set; }
        public string owner_name { get; set; }
        public string vehicle_name { get; set; }
        public bool vehicle_locked { get; set; }
        public uint vehicle_spawn_hash { get; set; }
        public string numberplate { get; set; }
        public float position_x { get; set; }
        public float position_y { get; set; }
        public float position_z { get; set; }
        public float rotation_x { get; set; }
        public float rotation_y { get; set; }
        public float rotation_z { get; set; }
        public float rotation { get; set; }
        public string vehicle_dimension { get; set; }
        public int vehicle_insurance_id { get; set; }
        public int vehicle_garage_id { get; set; }
        public double vehicle_fuel { get; set; } = 100;
        public ulong vehicle_distance { get; set; }
        public float vehicle_health { get; set; } = 1000;
        public int dealership_id { get; set; } = -1;
        public long dealership_price { get; set; } = -1;
        public int dealership_spot_id { get; set; } = -1;

        [NotMapped]
        public bool[] vehicle_doors { get; set; } = new bool[] { false, false, false, false, false, false };
        [NotMapped]
        public bool[] vehicle_windows { get; set; } = new bool[] { false, false, false, false, false, false };
        [NotMapped]
        public bool engine_status { get; set; }
        [NotMapped]
        public int indicator_status { get; set; } = -1;
        [NotMapped]
        public bool vehicle_siren { get; set; }
        [NotMapped]
        public bool emergency_lights { get; set; }
        [NotMapped]
        public VehicleMods vehicle_mods { get; set; }
        [NotMapped]
        public List<VehicleKey> vehicle_key_holders { get; set; } = new List<VehicleKey>();
        [NotMapped]
        public float dirt_level { get; set; } = new Random().Next(2, 15);
        [NotMapped]
        public double vehicle_fuel_purchase { get; set; } = -1;
        [NotMapped]
        public long vehicle_fuel_purchase_price { get; set; }
        [NotMapped]
        public int player_refuelling_char_id { get; set; } = -1;
        [NotMapped]
        public double speed_limit { get; set; } = -1;
        [NotMapped]
        public int dynamic_dealer_spot_id { get; set; } = -1;
    }


    class VehicleDimensions
    {
        public static readonly string World = "world";
        public static readonly string Insurance = "insurance";
        public static readonly string Garage = "Garage";
        public static readonly Vector3 morsPosition = new Vector3(-862, -265, 40);
        public static readonly int _morsId = 0;
    }
}
