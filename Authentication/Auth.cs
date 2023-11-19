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
using System.Collections;

namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
        public static readonly Dictionary<Player, User> UserData = new Dictionary<Player, User>();

        [RemoteEvent("server:recieveAuthInfo")]
        public void recieveAuthInfo(Player player, string data)
        {
            UserCredentials userCredentials = JsonConvert.DeserializeObject<UserCredentials>(data);

            Console.WriteLine($"{userCredentials.username} {userCredentials.password} {userCredentials.rememberMe}");

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAccount = dbContext.accounts.Where(b => b.username == userCredentials.username).FirstOrDefault();

                if(findAccount != null)
                {
                    bool passwordHashCompare = comparePassword(findAccount.password, userCredentials.password);

                    if (passwordHashCompare)
                    {
                        User user = new User
                        {
                            username = findAccount.username,
                            accountId = findAccount.account_id,
                            adminLevel = findAccount.admin_status,
                        };

                        UserData.Add(player, user);

                        player.TriggerEvent("client:loginEnd");

                        Console.WriteLine($"User {findAccount.username} (#{findAccount.account_id}) has logged in.");
                    } else {
                        Console.WriteLine("Password was doesn't match account");
                    }

                } else {
                    Console.WriteLine("no acount was found");
                    return;
                } 

            }
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void OnPlayerDisconnect(Player player, DisconnectionType type, string reason)
        {
            if(UserData.ContainsKey(player))
            {
                UserData.Remove(player);
            }
        }

        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.TriggerEvent("client:loginStart");
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

    class User
    {
        public int accountId { get; set; }
        public int playerId { get; set; }
        public string username { get; set; }
        public int adminLevel { get; set; }
    }

}
