using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Vehicles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CloudRP.Database
{
    public class DefaultDbContext : DbContext
    {
        private const string connectionString = "Server=localhost;Database=cloud_rp;Uid=root;Pwd=rootadmin13";

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(connectionString);
        }

        public DbSet<Account> accounts { get; set; }
        public DbSet<DbVehicle> vehicles { get; set; }
        public DbSet<DbCharacter> characters { get; set; }

    }

    public class BaseEntity
    {
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}