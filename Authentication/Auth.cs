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
using CloudRP.PlayerData;


namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
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

                        PlayersData.setPlayerAccountData(player, user);
                        setUserToCharacterSelection(player, user);

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

        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.TriggerEvent("client:loginStart");
        }

        void welcomeAndSpawnPlayer(Player player, User user)
        {
            player.TriggerEvent("client:loginEnd");

            if (user.adminLevel > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);
                NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[STAFF]!{white} " + $"Welcome {colouredRank}" + user.adminName);
            }
            NAPI.Chat.SendChatMessageToPlayer(player, Chat.CloudRP + $"Welcome back to Cloud RP {user.username}");

        }

        public static void setUserToCharacterSelection(Player player, User userData)
        {
            if (userData == null) return;

            userData.isOnCharacterCreation = true;

            PlayersData.setPlayerAccountData(player, userData);

        }

    }

}
