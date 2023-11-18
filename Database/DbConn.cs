

using CloudRP.Authentication;
using Microsoft.EntityFrameworkCore;
using static CloudRP.Authentication.Account;

namespace CloudRP.Database
{
    internal class DbConn : DbContext 
    {
        public DbSet<AccountModel> Accounts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("server=127.0.0.1;port=3306;database=cloud_rp;user=root;password=rootadmin13;");
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }

    }
}
