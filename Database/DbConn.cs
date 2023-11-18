using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using CloudRP.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CloudRP.Database
{
    public class DefaultDbContext : DbContext
    {
        // Connection string, more details below 
        private const string connectionString = "Server=localhost;Database=cloud_rp;Uid=root;Pwd=rootadmin13";

        // Initialize a new MySQL connection with the given connection parameters 
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(connectionString);
        }

        // Account model class created somewhere else 
        public DbSet<Account> accounts { get; set; }
    }
}