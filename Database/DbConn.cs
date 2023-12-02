using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using CloudRP.Admin;
using CloudRP.AntiCheat;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Vehicles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CloudRP.Database
{
    public class DefaultDbContext : DbContext
    {
        public static readonly string connectionStringKey = "DatabaseConnectionString";

        private string connectionString = Environment.GetEnvironmentVariable(connectionStringKey);


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(connectionString);
        }

        public DbSet<Account> accounts { get; set; }
        public DbSet<DbVehicle> vehicles { get; set; }
        public DbSet<DbCharacter> characters { get; set; }
        public DbSet<Ban> bans { get; set; }
        public DbSet<CharacterModel> character_models { get; set; }
        public DbSet<CharacterConnection> server_connections { get; set; }

    }

    public class BaseEntity
    {
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}