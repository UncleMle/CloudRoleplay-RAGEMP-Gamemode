using CloudRP.Authentication;
using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using static CloudRP.Authentication.Account;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {
        [Command("makeadmin")]
        public void makeAdmin(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "Example chat message");
        }

        [Command("makeaccount")]
        public void makeAccount(Player player) {
            NAPI.Chat.SendChatMessageToPlayer(player, "Make");
        }

        [Command("browser", "~o~/browser [browserName]")]
        public void browser(Player player, string browserName)
        {
            player.TriggerEvent("browser:pushRouter", browserName);
            NAPI.Chat.SendChatMessageToPlayer(player, "Triggered browser:pushRouter for browser " + browserName);
        }

        [Command("register")]
        public void createAccount(Player player)
        {
            // create a new Account object
            var account = new Account
            {
                username = "unclemole",
                password = "examplepswrd"
            };

            // When created like this, the context will be immediately deleted AKA disposed. 
            // This will make sure you don't have slowdowns with database calls if one day your server becomes popular
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                // Add this account data to the current context
                dbContext.accounts.Add(account);
                // And finally insert the data into the database
                dbContext.SaveChanges();
            }
        }
    }
}
