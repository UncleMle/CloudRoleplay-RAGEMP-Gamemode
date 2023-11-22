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
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAccount = dbContext.accounts.Where(b => b.username == userCredentials.username).FirstOrDefault();

                if(findAccount != null)
                {
                    bool passwordHashCompare = AuthUtils.comparePassword(findAccount.password, userCredentials.password);

                    if (passwordHashCompare)
                    {
                        User user = createUser(findAccount);

                        findAccount.client_serial = player.Serial;
                        findAccount.user_ip = player.Address;

                        dbContext.Update(findAccount);
                        dbContext.SaveChanges();

                        PlayersData.setPlayerAccountData(player, user);
                        setUserToCharacterSelection(player, user);

                        if(userCredentials.rememberMe)
                        {
                            setUpAutoLogin(player, findAccount);
                        }

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
            uiHandling.pushRouterToClient(player, Browsers.LoginPage);
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

                    if (character == null) return;

                    Chat.charSysPrint($"Character {character.character_name} has logged in (#{character.character_id})");
                    PlayersData.setPlayerCharacterData(player, character);
                    welcomeAndSpawnPlayer(player, userData, character);
                }
            };
        }

        [RemoteEvent("server:handlePlayerJoining")]
        public void onPlayerJoin(Player player, string autoLoginKey)
        {
            if(autoLoginKey != null)
            {
                Account findAccount = null;

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    findAccount = dbContext.accounts.Where(acc => acc.user_ip == player.Address && acc.auto_login == 1 && acc.auto_login_key == autoLoginKey && acc.client_serial == player.Serial && acc.ban_status == 0).FirstOrDefault();


                    if (findAccount == null) return;

                    User user = createUser(findAccount);

                    findAccount.client_serial = player.Serial;
                    findAccount.user_ip = player.Address;


                    dbContext.Update(findAccount);
                    dbContext.SaveChanges();

                    PlayersData.setPlayerAccountData(player, user);
                    setUserToCharacterSelection(player, user);
                }
            }
        }

        public static User createUser(Account accountData)
        {
            User user = new User
            {
                username = accountData.username,
                accountId = accountData.account_id,
                adminLevel = accountData.admin_status,
                adminName = accountData.admin_name,
                emailAddress = accountData.email_address,
            };

            return user;    
        }

        void welcomeAndSpawnPlayer(Player player, User user, DbCharacter characterData)
        {
            player.TriggerEvent("client:loginEnd");
            player.TriggerEvent("client:moveSkyCamera", "up", 1);
            uiHandling.togglePlayerChat(player, true);

            if (user.adminLevel > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);
                NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[STAFF]!{white} " + $"Welcome {colouredRank}" + user.adminName);
            }

            player.Position = new Vector3(characterData.position_x, characterData.position_y, characterData.position_z);
            player.Health = characterData.character_health;

            NAPI.Chat.SendChatMessageToPlayer(player, Chat.CloudRP + $"Welcome back to Cloud RP {user.username}");
            uiHandling.pushRouterToClient(player, Browsers.None);

            player.TriggerEvent("client:moveSkyCamera", "down");
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

        public void setUpAutoLogin(Player player, Account userAccount)
        {
            string randomString = AuthUtils.generateString(6);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                userAccount.auto_login_key = randomString;
                userAccount.auto_login = 1;

                dbContext.Update(userAccount);
                dbContext.SaveChanges();
            };

            player.TriggerEvent("client:setAuthKey", randomString);
        }

    }

}
