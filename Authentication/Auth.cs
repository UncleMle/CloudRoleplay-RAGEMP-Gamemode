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
using CloudRP.Admin;
using CloudRP.Utils;


namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
        public static readonly Dictionary<Player, User> UserData = new Dictionary<Player, User>();

        [RemoteEvent("server:recieveAuthInfo")]
        public void recieveAuthInfo(Player player, string data)
        {
            UserCredentials userCredentials = JsonConvert.DeserializeObject<UserCredentials>(data);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAccount = dbContext.accounts.Where(b => b.username == userCredentials.username).FirstOrDefault();

                if(findAccount != null)
                {
                    bool passwordHashCompare = AuthUtils.comparePassword(findAccount.password, userCredentials.password);

                    if (passwordHashCompare)
                    {
                        User user = new User
                        {
                            username = findAccount.username,
                            accountId = findAccount.account_id,
                            adminLevel = findAccount.admin_status,
                            adminName = findAccount.admin_name,
                            emailAddress = findAccount.email_address,
                        };

                        addUserKey(player, user);
                        welcomeUser(player, user);

                        PlayerData.PlayersData.setPlayerAccountData(player, user);

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
            removeUserKey(player);
        }

        void addUserKey(Player player, User user)
        {
            if(UserData.ContainsKey(player))
            {
                removeUserKey(player);
            }

            UserData.Add(player, user);
        }

        void removeUserKey(Player player)
        {
            if (UserData.ContainsKey(player))
            {
                UserData.Remove(player);
            }
        }

        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.TriggerEvent("client:loginStart");
        }

        void welcomeUser(Player player, User user)
        {
            player.TriggerEvent("client:loginEnd");

            if (user.adminLevel > 0)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);


                NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[STAFF]!{white} " + $"Welcome {colouredRank}" + user.adminName);
            }
            NAPI.Chat.SendChatMessageToPlayer(player, Chat.CloudRP + $"Welcome back to Cloud RP {user.username}");

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
        public bool adminDuty { get; set; } = false;
        public string adminName { get; set; }
        public string emailAddress { get; set; }    
    }

    class SharedData
    {
        public int accountId { get; set; }
        public int playerId { get; set; }
        public string username { get; set; }
        public int adminLevel { get; set; }
        public bool adminDuty { get; set; } = false;
        public string adminName { get; set; }
    }

}
