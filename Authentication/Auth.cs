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
using CloudRP.Character;


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

        [RemoteEvent("server:recieveCharacterName")]
        public void onEnterCharacterName(Player player, string name)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter character = null;

            if(userData != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    character = dbContext.characters.Where(b => b.character_name == name && b.owner_id == userData.accountId).FirstOrDefault();

                    if (character == null)
                    {
                        uiHandling.sendMutationToClient(player, "setCharacterSelection", "toggle", false);
                        return;
                    }

                    PlayersData.setPlayerCharacterData(player, character);
                    welcomeAndSpawnPlayer(player, userData, character);
                }
            }
            else
            {
                uiHandling.sendMutationToClient(player, "setCharacterSelection", "toggle", false);
            }
            
        }

        void welcomeAndSpawnPlayer(Player player, User user, DbCharacter characterData)
        {
            player.TriggerEvent("client:loginEnd");

            if (user.adminLevel > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);
                NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[STAFF]!{white} " + $"Welcome {colouredRank}" + user.adminName);
            }

            player.Position = new Vector3(characterData.position_x, characterData.position_y, characterData.position_z);
            player.Health = characterData.character_health;

            NAPI.Chat.SendChatMessageToPlayer(player, Chat.CloudRP + $"Welcome back to Cloud RP {user.username}");

        }

        public static void setUserToCharacterSelection(Player player, User userData)
        {
            if (userData == null) return;

            userData.isOnCharacterCreation = true;

            PlayersData.setPlayerAccountData(player, userData);

            Console.WriteLine($"{userData.username} (#{userData.accountId}) has entered character selection process.");

            string mutationName = "setCharacterSelection";

            uiHandling.sendMutationToClient(player, mutationName, "toggle", true);
        }

        /* Dummy Data
        public static void createCharacter()
        {

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbCharacter character = new DbCharacter 
                {
                    character_health = 100,
                    character_isbanned = 0,
                    character_name = "Alex_Dover",
                    CreatedDate = DateTime.Now,
                    last_login = DateTime.Now,
                    money_amount = 12000,
                    position_x = 0,
                    position_y = 0,
                    UpdatedDate = DateTime.Now,
                    play_time_minutes = 0,
                };

                dbContext.characters.Add(character);
                dbContext.SaveChanges();
            }

        }
        */

    }

}
