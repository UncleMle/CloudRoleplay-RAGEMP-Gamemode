using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.InventorySystem;
using CloudRP.Utils;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace CloudRP.PlayerData
{
    public static class PlayerExtensions
    {
        public static void setPlayerAccountData(this Player player, User userData, bool triggerShared = true, bool updateDb = false)
        {
            Console.WriteLine("Set acc data " + JsonConvert.SerializeObject(userData));

            if (!PlayersData.checkIfAccountIsLogged(userData.account_id))
            {
                player.SetCustomData(PlayersData._sharedAccountDataIdentifier, userData);

                if (triggerShared)
                {
                    SharedDataAccount sharedData = JsonConvert.DeserializeObject<SharedDataAccount>(JsonConvert.SerializeObject(userData));

                    player.SetCustomSharedData(PlayersData._sharedAccountDataIdentifier, sharedData);
                }

                if (updateDb)
                {
                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        Account targetAcc = JsonConvert.DeserializeObject<Account>(JsonConvert.SerializeObject(userData));

                        dbContext.Attach(targetAcc);
                        dbContext.Entry(targetAcc).State = EntityState.Modified;

                        var entry = dbContext.Entry(targetAcc);

                        Type type = typeof(Account);
                        PropertyInfo[] properties = type.GetProperties();
                        foreach (PropertyInfo property in properties)
                        {
                            if (property.GetValue(targetAcc, null) == null)
                            {
                                entry.Property(property.Name).IsModified = false;
                            }
                        }

                        dbContext.SaveChanges();
                    }
                }
            }
        }

        public static void setPlayerCharacterData(this Player player, DbCharacter character, bool resyncModel = true, bool updateDb = false)
        {
            if (!PlayersData.checkIfCharacterIsLogged(character.character_id))
            {
                player.SetCustomData(PlayersData._sharedCharacterDataIdentifier, character);

                SharedDataCharacter sharedData = JsonConvert.DeserializeObject<SharedDataCharacter>(JsonConvert.SerializeObject(character));

                player.SetCustomSharedData(PlayersData._sharedCharacterDataIdentifier, sharedData);
                setCharacterHungerAndThirst(player, character.character_hunger, character.character_water);
                setPlayerVoiceStatus(player, character.voiceChatState);

                if (resyncModel)
                {
                    setCharacterClothes(player, character.characterClothing);
                    setCharacterModel(player, character.characterModel);
                }

                if (updateDb)
                {
                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        dbContext.Update(character);
                        dbContext.SaveChanges();
                    }
                }
            }
        }

        public static void setPlayerVoiceStatus(this Player player, bool tog)
        {
            player.SetCustomSharedData(PlayersData._voipStatusKey, tog);
        }

        public static void setCharacterHungerAndThirst(this Player player, double hunger, double water)
        {
            player.SetCustomSharedData(PlayersData._characterFoodAndWaterKey, new HungerThirst
            {
                hunger = hunger,
                water = water
            });
        }

        public static void setCharacterClothes(this Player player, CharacterClothing clothes)
        {
            player.SetCustomSharedData(PlayersData._characterClothesKey, clothes);
        }

        public static void setCharacterModel(this Player player, CharacterModel model)
        {
            player.SetCustomSharedData(PlayersData._characterModelKey, model);
        }

        public static User getPlayerAccountData(this Player player)
        {
            User playerData = player.GetData<User>(PlayersData._sharedAccountDataIdentifier);
            return playerData;
        }

        public static DbCharacter getPlayerCharacterData(this Player player)
        {
            DbCharacter character = player.GetData<DbCharacter>(PlayersData._sharedCharacterDataIdentifier);
            return character;
        }

        public static int getId(this Player player)
        {
            int id = -1;

            if(player.getPlayerAccountData() != null)
            {
                id = player.getPlayerAccountData().account_id;
            } 

            return id;
        }
        
        public static int getAdmin(this Player player)
        {
            int adminStatus = -1;

            if(player.getPlayerAccountData() != null)
            {
                adminStatus = player.getPlayerAccountData().admin_status;
            } 

            return adminStatus;
        }

        public static void banPlayer(this Player banPlayer, int time, User adminUserData, User banPlayerUserData, string reason)
        {
            if(NAPI.Player.IsPlayerConnected(banPlayer))
            {
                banPlayer.SetCustomData(PlayersData._isBanned, true);

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    long minuteSeconds = time * 60;
                    long issueDateUnix = CommandUtils.generateUnix();
                    long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + minuteSeconds;

                    Ban ban = new Ban
                    {
                        account_id = banPlayerUserData.account_id,
                        admin = adminUserData.admin_name,
                        ban_reason = reason,
                        ip_address = banPlayer.Address,
                        lift_unix_time = lift_unix_time,
                        social_club_id = banPlayer.SocialClubId,
                        social_club_name = banPlayer.SocialClubName,
                        client_serial = banPlayer.Serial,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        issue_unix_date = issueDateUnix,
                        username = banPlayerUserData.username
                    };

                    Account findAccount = dbContext.accounts.Find(banPlayerUserData.account_id);

                    if (findAccount != null)
                    {
                        findAccount.ban_status = 1;
                        findAccount.auto_login = 0;
                        dbContext.Update(findAccount);
                    }

                    dbContext.Add(ban);
                    dbContext.SaveChanges();

                    banPlayer.setPlayerToBanScreen(ban);
                }
            }
        }

        public static bool isBanned(this Player player)
        {
            return player.GetData<bool>(PlayersData._isBanned);
        }

        public static Ban checkPlayerIsBanned(this Player player)
        {
            Ban returnBanData = null;

            try
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    returnBanData = dbContext.bans.Where(ban =>
                            ban.client_serial == player.Serial ||
                            ban.social_club_name == player.SocialClubName ||
                            ban.social_club_id == player.SocialClubId ||
                            ban.ip_address == player.Address)
                        .FirstOrDefault();

                    if (returnBanData != null && returnBanData.lift_unix_time < CommandUtils.generateUnix() && returnBanData.lift_unix_time != -1)
                    {
                        Account findUserAccount = dbContext.accounts.Find(returnBanData.account_id);

                        if (findUserAccount != null)
                        {
                            findUserAccount.ban_status = 0;
                            dbContext.accounts.Update(findUserAccount);
                        }

                        dbContext.bans.Remove(returnBanData);
                        dbContext.SaveChanges();
                        returnBanData = null;
                    }
                }
            }
            catch
            {
            }

            if(returnBanData != null)
            {
                player.SetData(PlayersData._isBanned, true);
            }

            return returnBanData;
        }

        public static bool isImmuneTo(this Player target, Player player)
        {
            User targetData = target.getPlayerAccountData();
            User playerData = player.getPlayerAccountData();

            if (targetData != null && playerData != null && targetData.admin_status >= (int)AdminRanks.Admin_Developer && targetData.account_id != playerData.account_id)
            {
                return true;
            } else if(targetData.account_id != playerData.account_id)
            {
                CommandUtils.errorSay(player, "This player is immune to this command!");
            }
            return false;
        }

        public static void setPlayerToBanScreen(this Player player, Ban banData)
        {
            player.Dimension = Auth._startDimension;
            player.flushUserAndCharacterData();
            player.TriggerEvent("client:loginCameraStart");
            uiHandling.pushRouterToClient(player, Browsers.BanPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.BanData, banData);
        }

        public static bool checkUserData(this Player player, int adminRank, bool checkAduty = true)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null && userData.admin_status >= adminRank || checkAduty && userData.adminDuty)
            {
                return true;
            }
            
            AdminUtils.sendNoAuth(player);
            return false;
        }

        public static void addPlayerKey(this Player player, string usedKey)
        {
            List<string> usedKeys = new List<string>();

            if(player.GetData<List<string>>(PlayersData._playerKeysIdentifier) == null)
            {
                usedKeys.Add(usedKey);
                player.SetData(PlayersData._playerKeysIdentifier, usedKeys);
                return;
            }

            usedKeys = player.GetData<List<string>>(PlayersData._playerKeysIdentifier); 

            if(usedKeys.Contains(usedKey))
            {
                usedKeys.Remove(usedKey);
            }

            usedKeys.Add(usedKey);
            player.SetData(PlayersData._playerKeysIdentifier, usedKeys);
        }

        public static void flushUserAndCharacterData(this Player player, string[] excludes = null)
        {
            Console.WriteLine("Flush triggered exclude " + JsonConvert.SerializeObject(excludes));

            for (int i = 0; i < player.GetData<List<string>>(PlayersData._playerKeysIdentifier).Count; i++)
            {
                string item = player.GetData<List<string>>(PlayersData._playerKeysIdentifier)[i];
                
                if (!(excludes != null && excludes.Contains(item)))
                {
                    Console.WriteLine("Flush key " + item);
                    player.ResetData(item);
                    player.ResetOwnSharedData(item);
                    player.ResetSharedData(item);
                }
                
            }

            if(excludes.Length == 0)
            {
                player.ResetData();
            }
        }
    }
}
