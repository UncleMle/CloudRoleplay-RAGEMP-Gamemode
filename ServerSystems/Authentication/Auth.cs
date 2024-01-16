using GTANetworkAPI;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Linq;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.ChatSystem;
using CloudRP.PlayerSystems.DeathSystem;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;

namespace CloudRP.ServerSystems.Authentication
{
    internal class Auth : Script
    {
        public static Dictionary<Player, string> collectedAutoLoginKeys = new Dictionary<Player, string>();
        public static uint _startDimension = 20;
        public static string _startAdminPed = "ig_mp_agent14";
        public static string _otpStoreKey = "registering_otp";

        public Auth()
        {
            Vector3 spawnPos = new Vector3(DefaultSpawn.pos_x, DefaultSpawn.pos_y, DefaultSpawn.pos_z);
            NAPI.Server.SetDefaultSpawnLocation(spawnPos, 0);
        }

        #region Remote Events
        [RemoteEvent("server:recieveAuthInfo")]
        public void recieveAuthInfo(Player player, string data)
        {
            UserCredentials userCredentials = JsonConvert.DeserializeObject<UserCredentials>(data);
            User userData = player.getPlayerAccountData();

            if (userData != null || player.checkPlayerIsBanned() != null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAccount = dbContext.accounts
                    .Where(b => b.username == userCredentials.username.ToLower() || b.email_address == userCredentials.username.ToLower())
                    .FirstOrDefault();

                if (findAccount != null)
                {
                    bool passwordHashCompare = AuthUtils.comparePassword(findAccount.password, userCredentials.password);

                    if (passwordHashCompare)
                    {
                        Player findIsOnline = checkInGame(findAccount.account_id);

                        if (findIsOnline != null)
                        {
                            Ban ban = new Ban
                            {
                                account_id = -1,
                                admin = "System",
                                username = "N/A",
                                ban_reason = $"Attempting to breach accounts. REFID #{findAccount.account_id}",
                                ip_address = player.Address,
                                lift_unix_time = -1,
                                social_club_id = player.SocialClubId,
                                social_club_name = player.SocialClubName,
                                client_serial = player.Serial,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                issue_unix_date = CommandUtils.generateUnix(),
                            };

                            dbContext.bans.Add(ban);

                            AuthUtils.sendEmail(findAccount.email_address, "Authentication Warning", $"Our systems detected a third party attempting to gain access to your account (<b>{findAccount.username}</b>). We have blocked the login attempt. Please reset all related passwords immediately.");
                            NAPI.Chat.SendChatMessageToPlayer(findIsOnline, ChatUtils.red + "~h~[AUTHENTICATION WARNING] " + ChatUtils.White + "A third party attempted to login into your account. Please reset your account password immediately.");
                            player.KickSilent();
                            return;
                        }

                        User user = createUser(findAccount);

                        findAccount.client_serial = player.Serial;
                        findAccount.user_ip = player.Address;
                        findAccount.UpdatedDate = DateTime.Now;

                        dbContext.Update(findAccount);
                        dbContext.SaveChanges();

                        if (findAccount.ban_status == 1)
                        {
                            User acUser = new User
                            {
                                admin_name = "System"
                            };

                            player.banPlayer(-1, user, user, "Logging into banned accounts.");
                            return;
                        }

                        setUserToCharacterSelection(player, user);

                        if (userCredentials.rememberMe)
                        {
                            setUpAutoLogin(player, findAccount);
                        }

                        ChatUtils.formatConsolePrint($"User {findAccount.username} (#{findAccount.account_id}) has logged in.", ConsoleColor.Green);
                    }
                    else
                    {
                        uiHandling.sendPushNotifError(player, "Incorrect account credentials", 4000, true);
                    }

                }
                else
                {
                    uiHandling.sendPushNotifError(player, "Incorrect account credentials", 4000, true);
                    return;
                }

            }
        }

        [RemoteEvent("server:recieveRegister")]
        public void handleRegister(Player player, string data)
        {
            Register registeringData = JsonConvert.DeserializeObject<Register>(data);

            User userData = player.getPlayerAccountData();
            if (userData != null) return;

            if (AuthUtils.registerDetailsValid(player, registeringData))
            {
                enterRegisterOtpStage(player, registeringData);
            }
        }

        [RemoteEvent("server:resetPasswordAuth")]
        public void resetPasswordAuth(Player player, string emailAddress)
        {
            Ban ban = player.checkPlayerIsBanned();
            if (ban != null) return;

            if (!AuthUtils.isEmailValid(emailAddress))
            {
                uiHandling.sendPushNotifError(player, "Enter a valid email address.", 6600, true);
                return;
            }

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAcc = dbContext.accounts.Where(acc => acc.email_address == emailAddress).FirstOrDefault();

                if (findAcc != null)
                {
                    enterRegisterOtpStage(player, new Register
                    {
                        registerEmail = emailAddress,
                    });
                }

                uiHandling.sendPushNotif(player, "If an account was found an OTP will be sent to the provided email.", 14000, false, false);
                uiHandling.setLoadingState(player, false);
                uiHandling.setAuthState(player, AuthStates.resettingPassword);
            }
        }

        [RemoteEvent("server:togglePlayerAutoLogin")]
        public void togglePlayerAutoLogin(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null)
            {
                if (userData.auto_login == 1)
                {
                    userData.auto_login = 0;
                }
                else
                {
                    userData.auto_login = 1;
                }

                player.setPlayerAccountData(userData, false, true);

                uiHandling.sendPushNotif(player, $"You {(userData.auto_login == 1 ? "enabled" : "disabled")} autologin.", 6600, true, true, true);
            }
        }

        [RemoteEvent("server:resetPassword")]
        public void resetPassword(Player player, string data)
        {
            if (data == null) return;
            OtpStore playerOtpData = player.GetData<OtpStore>(_otpStoreKey);
            ResetPass passReset = JsonConvert.DeserializeObject<ResetPass>(data);

            if (passReset.otpCode.Length == 0 || passReset.password.Length == 0 || passReset.passwordConfirm.Length == 0)
            {
                uiHandling.sendPushNotifError(player, "Ensure all fields are filled.", 6000, true);
                return;
            }

            if (passReset.password != passReset.passwordConfirm)
            {
                uiHandling.sendPushNotifError(player, "Ensure password confirmation matches password", 6000, true);
                return;
            }

            if (playerOtpData == null)
            {
                uiHandling.setLoadingState(player, false);
                uiHandling.setAuthState(player, "");
                return;
            }

            if (passReset.otpCode != playerOtpData.otp || CommandUtils.generateUnix() - playerOtpData.unixMade > 180)
            {
                uiHandling.setAuthState(player, "");
                uiHandling.sendPushNotifError(player, "The entered OTP was invalid.", 6000, true);
                return;
            }

            if (playerOtpData.registeringData.registerEmail != null && passReset.password != null && passReset.passwordConfirm != null)
            {

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account find = dbContext.accounts.Where(acc => acc.email_address == playerOtpData.registeringData.registerEmail).FirstOrDefault();

                    if (find == null)
                    {
                        uiHandling.sendPushNotifError(player, "An error occured during this process.", 5000, true);
                        uiHandling.setAuthState(player, "");
                        return;
                    }

                    string newHash = AuthUtils.hashPasword(passReset.password);

                    find.password = newHash;


                    uiHandling.sendPushNotif(player, "You have reset your password!", 6000, false, false, true);
                    uiHandling.setAuthState(player, "");
                    dbContext.Update(find);
                    dbContext.SaveChanges();
                }
            }
        }

        [RemoteEvent("server:authRecieveOtp")]
        public void recieveAuthOtp(Player player, string otpCode)
        {
            uiHandling.setLoadingState(player, false);
            OtpStore playerOtpStore = player.GetData<OtpStore>(_otpStoreKey);
            if (playerOtpStore == null || playerOtpStore.registeringData == null)
            {
                uiHandling.setAuthState(player, AuthStates.otp);

                return;
            }

            playerOtpStore.otpTries++;

            player.SetCustomData(_otpStoreKey, playerOtpStore);

            if (playerOtpStore.otpTries > 15)
            {
                uiHandling.setAuthState(player, AuthStates.login);

                uiHandling.sendPushNotifError(player, "You entered the wrong OTP code too many times.", 7500);
                return;
            }

            if (playerOtpStore.otp != otpCode || playerOtpStore.unixMade > CommandUtils.generateUnix() + 280)
            {
                uiHandling.sendPushNotifError(player, "Invalid OTP code.", 2000);
                return;
            }

            if (playerOtpStore.registeringData != null)
            {
                createAccount(player, playerOtpStore.registeringData);
                return;
            }
        }

        [RemoteEvent("server:recieveCharacterName")]
        public void onEnterCharacterName(Player player, string name)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null && player.checkPlayerIsBanned() == null && player.getPlayerCharacterData() == null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbCharacter character = dbContext.characters
                        .Where(b => b.character_name == name && b.owner_id == userData.account_id)
                        .FirstOrDefault();
                    if (character == null || character?.character_isbanned == 1) return;
                    CharacterModel charModel = dbContext.character_models
                        .Where(charModel => charModel.owner_id == character.character_id)
                        .FirstOrDefault();
                    if (charModel == null) return;
                    CharacterClothing charClothing = dbContext.character_clothes
                        .Where(clothes => clothes.character_id == character.character_id)
                        .FirstOrDefault();
                    List<Tattoo> charTats = dbContext.player_tattoos
                        .Where(tat => tat.tattoo_owner_id == character.character_id)
                        .ToList();

                    bool wasFoundInGame = false;

                    NAPI.Pools.GetAllPlayers().ForEach(p =>
                    {
                        if(p.getPlayerCharacterData()?.character_id == character.character_id)
                        {
                            wasFoundInGame = true;
                        }
                    });

                    if(!wasFoundInGame)
                    {
                        character.UpdatedDate = DateTime.Now;
                        character.last_login = DateTime.Now;
                        dbContext.Update(character);
                        dbContext.SaveChanges();

                        character.characterModel = charModel;
                        character.characterClothing = charClothing;
                        character.characterModel.player_tattos = charTats;

                        player.Dimension = character.player_dimension;
                        player.Position = new Vector3(character.position_x, character.position_y, character.position_z);
                        player.Health = character.character_health;

                        ChatUtils.formatConsolePrint($"Character {character.character_name} has logged in (#{character.character_id})", ConsoleColor.Yellow);
                        player.setPlayerCharacterData(character, true);
                        DiscordUtils.creationConnection(player, character, LogCreation.Join);

                        Chat.welcomePlayerOnSpawn(player);

                        if (character.injured_timer > 0)
                        {
                            DeathEvent.updateAndSetInjuredState(player, character, character.injured_timer);
                        }

                        welcomeAndSpawnPlayer(player);
                    }
                }
            };
        }

        [RemoteEvent("server:handlePlayerJoining")]
        public void onPlayerJoin(Player player, string autoLoginKey)
        {
            if (autoLoginKey != null && player.getPlayerAccountData() == null)
            {
                Account findAccount = null;

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account validateKey = dbContext.accounts
                        .Where(acc => acc.auto_login_key == autoLoginKey).FirstOrDefault();

                    if (validateKey != null && !collectedAutoLoginKeys.ContainsKey(player))
                    {
                        collectedAutoLoginKeys.Add(player, autoLoginKey);
                    }

                    findAccount = dbContext.accounts
                        .Where(acc => acc.user_ip == player.Address && acc.auto_login == 1 && acc.auto_login_key == autoLoginKey && acc.client_serial == player.Serial && acc.ban_status == 0)
                        .FirstOrDefault();


                    if (findAccount == null) return;

                    User user = createUser(findAccount);

                    findAccount.client_serial = player.Serial;
                    findAccount.user_ip = player.Address;
                    findAccount.UpdatedDate = DateTime.Now;

                    dbContext.Update(findAccount);
                    dbContext.SaveChanges();

                    uiHandling.resetMutationPusher(player, MutationKeys.PlayerCharacters);
                    setUserToCharacterSelection(player, user);
                }
            }
        }
        #endregion

        #region Global Methods
        public static User createUser(Account accountData)
        {
            User newUser = JsonConvert.DeserializeObject<User>(JsonConvert.SerializeObject(accountData));
            return newUser;
        }

        void welcomeAndSpawnPlayer(Player player)
        {
            NAPI.Native.SendNativeToPlayer(player, Hash.SET_PLAYER_INVINCIBLE, false);

            AntiCheatSystem.sleepClient(player);
            player.TriggerEvent("client:loginEnd");
            player.TriggerEvent("client:moveSkyCamera", "up", 1);

            DeathEvent.initCorpses(player);
            uiHandling.pushRouterToClient(player, Browsers.None);

            player.TriggerEvent("client:moveSkyCamera", "down");
        }

        public static void setUserToCharacterSelection(Player player, User userData)
        {
            if (player.checkPlayerIsBanned() != null) return;

            player.setPlayerAccountData(userData);

            ChatUtils.formatConsolePrint($"{userData.username} (#{userData.account_id}) has entered character selection process.", ConsoleColor.Yellow);

            CharacterSystem.fillCharacterSelectionTable(player, userData);
        }

        public void setUpAutoLogin(Player player, Account userAccount)
        {
            string randomString = AuthUtils.generateString(15) + userAccount.account_id;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                userAccount.auto_login_key = randomString;
                userAccount.auto_login = 1;

                dbContext.Update(userAccount);
                dbContext.SaveChanges();
            };

            player.TriggerEvent("client:setAuthKey", randomString);
        }

        public Player checkInGame(int accountId)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            Player wasFound = null;

            foreach (Player p in onlinePlayers)
            {
                User pData = p.getPlayerAccountData();

                if (pData != null)
                {
                    if (pData.account_id == accountId)
                    {
                        wasFound = p;
                    }
                }
            }

            return wasFound;
        }

        public void enterRegisterOtpStage(Player player, Register registeringData)
        {
            uiHandling.setAuthState(player, AuthStates.otp);

            string otp = AuthUtils.generateString(4, true);

            player.SetCustomData(_otpStoreKey, new OtpStore
            {
                otp = otp,
                otpTries = 0,
                registeringData = registeringData,
                unixMade = CommandUtils.generateUnix()
            });

            string otpContextEmail = $"Enter the OTP {otp} (This code is valid for 3 minutes)";

            AuthUtils.sendEmail(registeringData.registerEmail, "Cloud RP | OTP", AuthUtils.getEmailWithContext(otpContextEmail));
        }

        public static void createAccount(Player player, Register registeringData)
        {
            string passwordHash = AuthUtils.hashPasword(registeringData.registerPassword);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account creatingAccount = new Account
                {
                    admin_name = "notset",
                    admin_ped = _startAdminPed,
                    auto_login = 0,
                    ban_status = 0,
                    client_serial = player.Serial,
                    password = passwordHash,
                    email_address = registeringData.registerEmail,
                    social_club_id = player.SocialClubId,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now,
                    username = registeringData.registerUsername.ToLower(),
                    user_ip = player.Address,
                    vip_status = 0,
                    admin_status = (int)AdminRanks.Admin_None,
                    auto_login_key = "",
                    max_characters = 2
                };

                dbContext.Add(creatingAccount);
                dbContext.SaveChanges();

                creatingAccount.redeem_code = creatingAccount.account_id + AuthUtils.generateString(4);
                dbContext.Update(creatingAccount);
                dbContext.SaveChanges();


                uiHandling.sendPushNotif(player, $"You have successfully created an account.", 6000);
                User userData = createUser(creatingAccount);

                setUserToCharacterSelection(player, userData);
            }
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.setPlayerToLoginScreen();
        }
        #endregion
    }

}
