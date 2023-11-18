

using CloudRP.Authentication;
using Microsoft.EntityFrameworkCore;

namespace CloudRP.Database
{
    internal class DbConn : DbContext
    {
        public DbSet<Account> Accounts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("server=localhost;port=3306;database=cloud_rp;user=root;password=rootadmin13;");
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }

    }
}
