using CloudRP.Authentication;
using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Linq;
using static CloudRP.Authentication.Account;

namespace CloudRP
{
    public class Main : Script
    {
        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            var account = new Account
            {
                Username = "unclemole",
                Password = "examplepswrd"
            };

            // When created like this, the context will be immediately deleted AKA disposed. 
            // This will make sure you don't have slowdowns with database calls if one day your server becomes popular
            using (var dbContext = new DefaultDbContext())
            {
                // Add this account data to the current context
                dbContext.accounts.Add(account);
                // And finally insert the data into the database
                dbContext.SaveChanges();
            }
            Console.WriteLine("Gamemode started.");
        }
    }
}
