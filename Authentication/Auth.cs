using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            NAPI.Chat.SendChatMessageToAll($"Player {player.Name}");
        }

        // Authenticate Events
        [RemoteEvent("server:recieveAuthInfo")]
        public void recieveAuthInfo(Player player, string data)
        {
            UserCredentials userCredentials = JsonConvert.DeserializeObject<UserCredentials>(data);

            Console.WriteLine($"{userCredentials.username} {userCredentials.password} {userCredentials.rememberMe}");

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                var findAccount = dbContext.accounts.Where<Account>(b => b.username == userCredentials.username);
                Account accountFound = findAccount.FirstOrDefault();

                if(accountFound != null)
                {
                    Console.WriteLine("An account was found with username "+userCredentials.username+ " with account id "+ accountFound.account_id);
                } else {
                    Console.WriteLine("no acount was found");
                    return;
                }

                

            }

            /*
            Account account = new Account
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
            */
        }

        string hashPasword(string password)
        {
            byte[] salt = new byte[16];
            new RNGCryptoServiceProvider().GetBytes(salt);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            string savedPasswordHash = Convert.ToBase64String(hashBytes);
            return savedPasswordHash;
        }

        bool comparePassword(string savedHash, string passwordTwo)
        {
            bool isTheSame = true;

            byte[] hashBytes = Convert.FromBase64String(savedHash);
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);
            var pbkdf2 = new Rfc2898DeriveBytes(passwordTwo, salt, 100000);
            byte[] hash = pbkdf2.GetBytes(20);
            for (int i = 0; i < 20; i++)
                if (hashBytes[i + 16] != hash[i])
                    isTheSame = false;

            return isTheSame;
        }


    }

    class UserCredentials
    {
        public string username { get; set; }
        public string password { get; set; }
        public bool rememberMe { get; set; }
    }
}
