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
using System.Text.RegularExpressions;
using System.Net.Mail;
using System.Net;


namespace CloudRP.Authentication
{
    internal class Auth : Script
    {
        public static uint _startDimension = 20;
        public static string _startAdminPed = "ig_mp_agent14";
        public static string _emailUserEnv = "emailUser";
        public static string _emailPassEnv = "emailPass";
        public static string _otpStoreKey = "registering_otp";


        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            Vector3 spawnPos = new Vector3(DefaultSpawn.pos_x, DefaultSpawn.pos_y, DefaultSpawn.pos_z);
            NAPI.Server.SetDefaultSpawnLocation(spawnPos, 0);
        }

        [RemoteEvent("server:recieveAuthInfo")]
        public void recieveAuthInfo(Player player, string data)
        {
            UserCredentials userCredentials = JsonConvert.DeserializeObject<UserCredentials>(data);
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null || AdminUtils.checkPlayerIsBanned(player) != null) return;

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

                        if(findAccount.ban_status == 1)
                        {
                            User acUser = new User
                            {
                                adminName = "System"
                            };

                            AdminUtils.banAPlayer(-1, user, user, player, "Logging into banned accounts");
                            return;
                        }

                        setUserToCharacterSelection(player, user);

                        if(userCredentials.rememberMe)
                        {
                            setUpAutoLogin(player, findAccount);
                        }

                        Console.WriteLine($"User {findAccount.username} (#{findAccount.account_id}) has logged in.");
                    } else {
                        uiHandling.sendPushNotifError(player, "Incorrect account credentials", 4000);
                    }

                } else {
                    uiHandling.sendPushNotifError(player, "Incorrect account credentials", 4000);
                    Console.WriteLine("no acount was found");
                    return;
                } 

            }
        }

        [RemoteEvent("server:recieveRegister")]
        public void handleRegister(Player player, string data)
        {
            Register registeringData = JsonConvert.DeserializeObject<Register>(data);
            
            User userData = PlayersData.getPlayerAccountData(player);
            if (userData != null) return;

            if(AuthUtils.registerDetailsValid(player, registeringData))
            {
                enterRegisterOtpStage(player, registeringData);
            }
        }

        public void enterRegisterOtpStage(Player player, Register registeringData)
        {
            string mutationName = "setUserOtp";

            uiHandling.sendMutationToClient(player, mutationName, "toggle", true);

            string otp = AuthUtils.generateString(5);

            OtpStore otpStore = new OtpStore
            {
                otp = otp,
                otpTries = 0,
                registeringData = registeringData,
                unixMade = CommandUtils.generateUnix()
            };

            player.SetData(_otpStoreKey, otpStore);

            string otpContextEmail = $"Enter the OTP {otp} (This code is valid for 3 minutes)";

            AuthUtils.sendEmail(registeringData.registerEmail, "Cloud RP | OTP", AuthUtils.getEmailWithContext(otpContextEmail));
        }

        [RemoteEvent("server:authRecieveOtp")]
        public void recieveAuthOtp(Player player, string otpCode)
        {
            OtpStore playerOtpStore = player.GetData<OtpStore>(_otpStoreKey);
            if(playerOtpStore == null || playerOtpStore.registeringData == null)
            {
                uiHandling.sendMutationToClient(player, "setUserOtp", "toggle", false);

                return;
            }

            playerOtpStore.otpTries++;

            player.SetData(_otpStoreKey, playerOtpStore);

            if(playerOtpStore.otpTries > 15)
            {
                uiHandling.sendMutationToClient(player, "setUserOtp", "toggle", false);

                uiHandling.sendPushNotifError(player, "You entered the wrong OTP code too many times.", 7500);
                return;
            }

            if(playerOtpStore.otp != otpCode || playerOtpStore.unixMade > CommandUtils.generateUnix() + 280)
            {
                uiHandling.sendPushNotifError(player, "Invalid OTP code.", 2000);
                return;
            }

            string mutationName = "setUserOtp";

            uiHandling.sendMutationToClient(player, mutationName, "toggle", false);

            createAccount(player, playerOtpStore.registeringData);
        }

        public static void createAccount(Player player, Register registeringData)
        {
            string passwordHash = AuthUtils.hashPasword(registeringData.registerPassword);

            Account creatingAccount = new Account
            {
                admin_name = "Placeholder",
                admin_ped = _startAdminPed,
                auto_login = 0,
                ban_status = 0,
                client_serial = player.Serial,
                password = passwordHash,
                email_address = registeringData.registerEmail,
                social_club_id = player.SocialClubId,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                username = registeringData.registerUsername,
                user_ip = player.Address,
                vip_status = 0,
                admin_status = (int)AdminRanks.Admin_None,
                auto_login_key = ""
            };

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.Add(creatingAccount);
                dbContext.SaveChanges();
            }

            uiHandling.sendPushNotif(player, $"You have successfully created an account.", 6000);

            User userData = createUser(creatingAccount);

            setUserToCharacterSelection(player, userData);
        }

        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.Dimension = _startDimension;
            player.TriggerEvent("client:loginStart");
            uiHandling.pushRouterToClient(player, Browsers.LoginPage);
        }

        [RemoteEvent("server:recieveCharacterName")]
        public void onEnterCharacterName(Player player, string name)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter character = null;

            if(userData != null && AdminUtils.checkPlayerIsBanned(player) == null)
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

                    uiHandling.resetMutationPusher(player, MutationKeys.PlayerCharacters);
                    setUserToCharacterSelection(player, user);

                    return;
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
                adminPed = accountData.admin_ped
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
                NAPI.Chat.SendChatMessageToPlayer(player, AdminUtils.staffPrefix + $"Welcome {colouredRank}" + user.adminName);
            }

            player.Position = new Vector3(characterData.position_x, characterData.position_y, characterData.position_z);
            player.Health = characterData.character_health;

            NAPI.Chat.SendChatMessageToPlayer(player, Chat.CloudRP + $"Welcome back to Cloud RP {user.username}");
            uiHandling.pushRouterToClient(player, Browsers.None);
            player.Dimension = characterData.player_dimension;

            if(characterData.player_dimension != 0)
            {
                AdminUtils.staffSay(player, $"You have been spawned into dimension {characterData.player_dimension}.");
            }

            player.TriggerEvent("client:moveSkyCamera", "down");
        }

        public static void setUserToCharacterSelection(Player player, User userData)
        {
            if (AdminUtils.checkPlayerIsBanned(player) != null) return;

            PlayersData.setPlayerAccountData(player, userData);

            Console.WriteLine($"{userData.username} (#{userData.accountId}) has entered character selection process.");

            string mutationName = "setCharacterSelection";

            uiHandling.sendMutationToClient(player, mutationName, "toggle", true);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<DbCharacter> allPlayerCharacters = dbContext.characters.Where(character => character.owner_id == userData.accountId).ToList();

                allPlayerCharacters.ForEach(character =>
                {
                    Console.WriteLine("" + character.character_id);
                    uiHandling.handleObjectUiMutationPush(player, MutationKeys.PlayerCharacters, character);
                });
            }
        }

        public void setUpAutoLogin(Player player, Account userAccount)
        {
            string randomString = AuthUtils.generateString(6) + userAccount.account_id;

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
