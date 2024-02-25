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
using CloudRP.PlayerSystems.Jobs;
using CloudRP.ServerSystems.Middlewares;
using CloudRP.PlayerSystems.FactionSystems;
using CloudRP.Migrations;
using Discord;
using Microsoft.EntityFrameworkCore;
using System.Timers;

namespace CloudRP.ServerSystems.Authentication
{
    internal class Auth : Script
    {
        public static Dictionary<Player, string> collectedAutoLoginKeys = new Dictionary<Player, string>();
        public static string autoLoginDataKey = "server:auth:autoLoginAllowedUsername";
        public static uint _startDimension = 20;
        public static string _startAdminPed = "ig_mp_agent14";
        public static string _otpRegisterStoreKey = "auth_registering_otp";
        public static string _otpAccountStoreKey = "auth_account_otp";
        public static string _accountCreatedKey = "authentication:player:accountCreated";
        public static readonly int autoLoginValid_seconds = 300;
        public static Vector3 spawnPos = new Vector3(DefaultSpawn.pos_x, DefaultSpawn.pos_y, DefaultSpawn.pos_z);

        public Auth()
        {
            NAPI.Server.SetDefaultSpawnLocation(spawnPos, 0);

            Timer timer = new Timer
            {
                AutoReset = true,
                Interval = 5000,
                Enabled = true
            };

            timer.Elapsed += (object source, ElapsedEventArgs e) => 
            NAPI.Task.Run(() => handleNonAuthenticated());

            Main.resourceStart += () => ChatUtils.startupPrint("Started checking for non-authenticated users.");
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
                Account findAccount = null;
                AutoLoginData autoLogin = player.GetData<AutoLoginData>(autoLoginDataKey);

                if (autoLogin != null && player.GetData<AccountOtpStore>(_otpAccountStoreKey) == null)
                {
                    long differenceMinutes = (CommandUtils.generateUnix() - autoLogin.createdAt) / 60;

                    if (differenceMinutes > autoLoginValid_seconds / 60) uiHandling.sendPushNotifError(player, $"Your autologin for account {autoLogin.targetUsername} has expired {differenceMinutes.ToString("N0")} minutes ago.", 5500);
                    else findAccount = dbContext.accounts
                            .Where(user => user.account_id == autoLogin.targetAccountId &&
                             user.ban_status == 0)
                            .FirstOrDefault();
                } 
                else
                {
                    findAccount = dbContext.accounts
                                .Where(b => 
                                (b.username == userCredentials.username.ToLower() || b.email_address == userCredentials.username)
                                && b.ban_status == 0
                                )
                                .FirstOrDefault();
                }

                if(findAccount == null || findAccount != null && autoLogin == null && !AuthUtils.comparePassword(findAccount.password, userCredentials.password))
                {
                    uiHandling.sendPushNotifError(player, "Account wasn't found.", 4000, true);
                    return;
                }

                if (checkInGame(player, findAccount.email_address, findAccount.username, findAccount.account_id)) return;

                if(
                   findAccount.user_ip != player.Address ||
                   findAccount.client_serial != player.Serial ||
                   findAccount.social_club_id != player.SocialClubId
                )
                {
                    string otp = AuthUtils.generateString(5);

                    player.SetData(_otpAccountStoreKey, new AccountOtpStore
                    {
                        accountId = findAccount.account_id,
                        createdAt = CommandUtils.generateUnix(),
                        otpCode = otp,
                        username = findAccount.username,
                        rememberMe = userCredentials.rememberMe
                    });

                    AuthUtils.sendEmail(
                        findAccount.email_address, 
                        $"OTP Code for {findAccount.username}", 
                        $"The OTP code for your account {findAccount.username} is <b>{otp}</b>."
                    );

                    uiHandling.setLoadingState(player, false);
                    uiHandling.setAuthState(player, AuthStates.accountOtpState);
                    uiHandling.sendPushNotif(player, "Our systems have detected login from a new location. Please enter the OTP code sent to your email address.", 6600);
                    return;
                }

                loginInToAccount(player, findAccount, userCredentials.rememberMe);
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

        [RemoteEvent("server:resetPassword")]
        public void resetPassword(Player player, string data)
        {
            if (data == null) return;
            OtpStore playerOtpData = player.GetData<OtpStore>(_otpRegisterStoreKey);
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
                    Account find = dbContext.accounts
                        .Where(acc => acc.email_address == playerOtpData.registeringData.registerEmail)
                        .FirstOrDefault();

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
            OtpStore playerOtpStore = player.GetData<OtpStore>(_otpRegisterStoreKey);
            if (playerOtpStore == null || playerOtpStore.registeringData == null)
            {
                uiHandling.setAuthState(player, AuthStates.otp);
                return;
            }

            playerOtpStore.otpTries++;

            player.SetCustomData(_otpRegisterStoreKey, playerOtpStore);

            if (playerOtpStore.otpTries >= 10)
            {
                uiHandling.setAuthState(player, "");
                uiHandling.pushRouterToClient(player, Browsers.None);
                uiHandling.pushRouterToClient(player, Browsers.LoginPage);
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

        [RemoteEvent("server:recieveCharacterId")]
        public void onEnterCharacterName(Player player, int characterId)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null && player.checkPlayerIsBanned() == null && player.getPlayerCharacterData() == null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbCharacter character = dbContext.characters
                        .Where(b => b.character_id == characterId && b.owner_id == userData.account_id)
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

                    Player wasFoundInGame = checkInGameCharacter(character.character_id);

                    if(wasFoundInGame == null)
                    {
                        character.UpdatedDate = DateTime.Now;
                        character.last_login = DateTime.Now;
                        dbContext.Update(character);
                        dbContext.SaveChanges();

                        character.characterModel = charModel;

                        character.characterModel.player_tattos = charTats;

                        player.Name = character.character_name.Replace("_", " ");
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

                        if(character.freelance_job_data != null)
                        {
                            FreeLanceJobData data = JsonConvert.DeserializeObject<FreeLanceJobData>(character.freelance_job_data);

                            player.setFreelanceJobData(data);
                        }

                        if (character.faction_duty_status != -1) player.setFactionDuty((Factions)character.faction_duty_status, true);

                        if (character.faction_duty_uniform == -1)
                        {
                            character.characterClothing = charClothing;
                        }

                        character.cachedClothes = charClothing;

                        player.setPlayerCharacterData(character, true);
                        welcomeAndSpawnPlayer(player);
                        uiHandling.setLoadingState(player, false);
                    }
                }
            };
        }

        [RemoteEvent("server:handlePlayerJoining")]
        public void onPlayerJoin(Player player, string autoLoginKey)
        {
            if (autoLoginKey != null && player.getPlayerAccountData() == null && player.GetData<AccountOtpStore>(_otpAccountStoreKey) == null && player.GetData<OtpStore>(_otpRegisterStoreKey) == null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAccount = dbContext.accounts
                        .Where(acc =>
                        acc.auto_login_key == autoLoginKey &&
                        acc.user_ip == player.Address &&
                        acc.social_club_id == player.SocialClubId &&
                        acc.auto_login == 1 &&
                        acc.client_serial == player.Serial &&
                        acc.ban_status == 0)
                        .FirstOrDefault();

                    if (findAccount == null) return;

                    player.SetData(autoLoginDataKey, new AutoLoginData
                    {
                        targetAccountId = findAccount.account_id,
                        targetUsername = findAccount.username
                    });

                    uiHandling.handleObjectUiMutation(player, MutationKeys.AutoLogin, new AutoAuth
                    {
                        email = findAccount.email_address,
                        username = findAccount.username,
                    });

                    uiHandling.sendPushNotif(player, $"Auto login was found for account {findAccount.username}. And is valid for {autoLoginValid_seconds / 60} minutes.", 5000);
                }
            }
        }

        [RemoteEvent("server:authentication:recieveAccountOtp")]
        public void recieveAccountOtp(Player player, string otp)
        {
            AccountOtpStore accountOtpStore = player.GetData<AccountOtpStore>(_otpAccountStoreKey);

            if (accountOtpStore == null || player.getPlayerAccountData() != null) return;

            if((accountOtpStore.createdAt + 280) < CommandUtils.generateUnix())
            {
                uiHandling.setAuthState(player, "");
                uiHandling.sendPushNotifError(player, "Your OTP status is no longer valid. Try logging in again.", 6600, true);
                player.ResetData(_otpAccountStoreKey);
                return;
            }

            if(accountOtpStore.otpTries >= 10)
            {
                uiHandling.setAuthState(player, "");
                uiHandling.sendPushNotifError(player, "You entered the wrong OTP code too many times.", 6600, true);
                player.ResetData(_otpAccountStoreKey);
                return;
            }

            accountOtpStore.otpTries++;
            player.SetData(_otpAccountStoreKey, accountOtpStore);
            
            if(accountOtpStore.otpCode != otp)
            {
                uiHandling.sendPushNotifError(player, $"The entered OTP code is invalid.", 6600, true);
                return;
            }

            Account find = getAccountById(accountOtpStore.accountId);

            if (find == null)
            {
                uiHandling.sendPushNotifError(player, "An error occured logging you into this account.", 6600, true);
                return;
            }

            loginInToAccount(player, find, accountOtpStore.rememberMe);
        }
        #endregion

        #region Global Methods
        public void handleNonAuthenticated()
        {
            NAPI.Pools.GetAllPlayers().ForEach(player =>
            {
                if(player.getPlayerCharacterData() == null)
                {
                    player.Position = spawnPos;
                };
            });
        }

        public void loginInToAccount(Player player, Account findAccount, bool rememberMe)
        {
            if (checkInGame(player, findAccount.email_address, findAccount.username, findAccount.account_id)) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                player.ResetData(_otpAccountStoreKey);
                player.ResetData(_otpRegisterStoreKey);

                uiHandling.setLoadingState(player, false);
                User user = createUser(findAccount);

                findAccount.user_ip = player.Address;
                findAccount.client_serial = player.Serial;
                findAccount.user_ip = player.Address;
                findAccount.UpdatedDate = DateTime.Now;
                findAccount.social_club_id = player.SocialClubId;

                dbContext.Update(findAccount);
                dbContext.SaveChanges();

                if (findAccount.ban_status == 1)
                {
                    player.banPlayer(-1, user, user, "Logging into banned accounts.");
                    return;
                }

                setUserToCharacterSelection(player, user);

                if (rememberMe)
                {
                    setUpAutoLogin(player, findAccount);
                }

                ChatUtils.formatConsolePrint($"User {findAccount.username} (#{findAccount.account_id}) has logged in.", ConsoleColor.Green);
            }
        }

        public static Account getAccountById(int accountId)
        {
            Account find = null;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                find = dbContext.accounts
                    .Where(acc => acc.account_id == accountId && acc.ban_status == 0)
                    .FirstOrDefault();
            }

            return find;
        }

        public static User createUser(Account accountData)
           => JsonConvert.DeserializeObject<User>(JsonConvert.SerializeObject(accountData));

        void welcomeAndSpawnPlayer(Player player)
        {
            NAPI.Native.SendNativeToPlayer(player, Hash.SET_PLAYER_INVINCIBLE, false);

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
            checkVipStatus(player, userData);

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

        public bool checkInGame(Player player, string emailAddress, string username, int accountId)
        {
            bool found = false;
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            Player wasFound = null;

            foreach (Player p in onlinePlayers)
            {
                User pData = p.getPlayerAccountData();

                if (pData != null && pData.account_id == accountId)
                {
                    wasFound = p;
                }
            }
            
            if(wasFound != null)
            {
                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Ban ban = new Ban
                    {
                        account_id = -1,
                        admin = "System",
                        username = "N/A",
                        ban_reason = $"Attempting to breach accounts. REFID #{accountId}",
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

                    AuthUtils.sendEmail(emailAddress, "Authentication Warning", $"Our systems detected a third party attempting to gain access to your account (<b>{username}</b>). We have blocked the login attempt. Please reset all related passwords immediately.");
                    wasFound.SendChatMessage(ChatUtils.red + "~h~[AUTHENTICATION WARNING] " + ChatUtils.White + "A third party attempted to login into your account. Please reset your account password immediately.");
                    player.KickSilent();
                    found = true;
                }
            }

            return found;
        }
        
        public Player checkInGameCharacter(int characterId)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            Player wasFound = null;

            foreach (Player p in onlinePlayers)
            {
                DbCharacter charData = p.getPlayerCharacterData();

                if (charData != null && charData.character_id == characterId)
                {
                    wasFound = p;
                }
            }

            return wasFound;
        }

        public void enterRegisterOtpStage(Player player, Register registeringData)
        {
            uiHandling.setAuthState(player, AuthStates.otp);

            string otp = AuthUtils.generateString(4);

            player.SetCustomData(_otpRegisterStoreKey, new OtpStore
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
            if (player.GetData<bool>(_accountCreatedKey)) return;

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
                    admin_status = (int)AdminRanks.Admin_None,
                    auto_login_key = "",
                    max_characters = 2,
                    redeem_code = ""
                };

                dbContext.Add(creatingAccount);
                dbContext.SaveChanges();

                creatingAccount.redeem_code = creatingAccount.account_id + AuthUtils.generateString(4);
                dbContext.Update(creatingAccount);
                dbContext.SaveChanges();

                uiHandling.sendPushNotif(player, $"You have successfully created an account.", 6000);
                User userData = createUser(creatingAccount);

                setUserToCharacterSelection(player, userData);
                player.SetCustomData(_accountCreatedKey, true);
            }
        }

        public static void checkVipStatus(Player player, User user)
        {
            if (!user.vip_status) return;

            long difference = user.vip_unix_expires - CommandUtils.generateUnix();

            if(difference <= 0)
            {
                user.vip_status = false;
                player.setPlayerAccountData(user);
            }
        }

        public static int getVipDaysLeft(User user)
        {
            long secondsDiff = user.vip_unix_expires - CommandUtils.generateUnix();

            return (int)secondsDiff / 86400;
        }
        
        public static int getDaysSinceVip(User user)
        {
            long secondsDiff = CommandUtils.generateUnix() - user.vip_unix_expires;

            return (int)secondsDiff / 86400;
        }

        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            player.Name = NAPI.Server.GetServerName();
            player.setPlayerToLoginScreen(false);
        }
        #endregion
    }

}
