using System;
using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.GeneralSystems.HousingSystem;
using CloudRP.GeneralSystems.InventorySystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using CloudRP.VehicleSystems.VehicleModification;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using GTANetworkInternals;
using Microsoft.EntityFrameworkCore;

namespace CloudRP.ServerSystems.Database
{

    public class DefaultDbContext : DbContext
    {     
        /*
		<setting name = "host" value="localhost"/>
		<setting name = "username" value="username"/>
		<setting name = "password" value="userpassword"/>
		<setting name = "database" value="cloud_rp"/>

        meta.xml
        */

        //public static readonly string _databaseConnectionString = $"Server={Main._dbHost};Database={Main._dbDatabase};Uid={Main._dbUser};Pwd={Main._dbPassword}";
        public static readonly string _databaseConnectionString = $"Server=localhost;Database=cloud_rp;Uid=root;Pwd=rootadmin13";

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(_databaseConnectionString);
        }

        public DbSet<Account> accounts { get; set; }
        public DbSet<DbCharacter> characters { get; set; }
        public DbSet<Ban> bans { get; set; }
        public DbSet<CharacterModel> character_models { get; set; }
        public DbSet<CharacterConnection> server_connections { get; set; }
        public DbSet<Nickname> nicknames { get; set; }
        public DbSet<CharacterClothing> character_clothes { get; set; }
        public DbSet<VehicleMods> vehicle_mods { get; set; }
        public DbSet<VehicleKey> vehicle_keys { get; set; }
        public DbSet<DbVehicle> vehicles { get; set; }
        public DbSet<Tattoo> player_tattoos { get; set; }
        public DbSet<House> houses { get; set; }
        public DbSet<FloatingDo> floating_dos { get; set; }
        public DbSet<AdminMarker> admin_markers { get; set; }
        public DbSet<InventoryItem> inventory_items { get; set; }
    }

    public class BaseEntity
    {
        public string key_uuid = Guid.NewGuid().ToString();
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}