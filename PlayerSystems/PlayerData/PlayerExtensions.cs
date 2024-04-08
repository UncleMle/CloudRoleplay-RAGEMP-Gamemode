using CloudRP.PlayerSystems.Character;
using CloudRP.GeneralSystems.InventorySystem;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using CloudRP.ServerSystems.Utils;
using CloudRP.ServerSystems.AntiCheat;
using System.Threading.Tasks;

namespace CloudRP.PlayerSystems.PlayerData
{
    public static class PlayerExtensions
    {
        public static readonly string _atBanScreenIdentifier = "server:auth:atBanScreen";

        public static void setPlayerAccountData(this Player player, User userData, bool triggerShared = true, bool updateDb = false)
        {
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
                player.setCharacterHungerAndThirst(character.character_hunger, character.character_water);
                player.setPlayerVoiceStatus(character.voiceChatState);

                if (resyncModel)
                {
                    player.setCharacterClothes(character.characterClothing);
                    player.setCharacterModel(character.characterModel);
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

        public static void setRouteFrozen(this Player player, bool toggle)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            
            if(characterData != null)
            {
                characterData.routeIsFrozen = toggle;
                player.setPlayerCharacterData(characterData, false);
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

        public static void setCharacterModel(this Player player, CharacterModel model, bool updateDb = false)
        {
            player.SetCustomSharedData(PlayersData._characterModelKey, model);
        
            if(updateDb)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.character_models.Update(model);
                    dbContext.SaveChanges();
                }
            }
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

            if (player.getPlayerAccountData() != null)
            {
                id = player.getPlayerAccountData().account_id;
            }

            return id;
        }

        public static int getAdmin(this Player player)
        {
            int adminStatus = -1;

            if (player.getPlayerAccountData() != null)
            {
                adminStatus = player.getPlayerAccountData().admin_status;
            }

            return adminStatus;
        }
        
        public static bool adminDuty(this Player player)
        {
            bool aduty = false;

            if (player.getPlayerAccountData().adminDuty)
            {
                aduty = true;
            }

            return aduty;
        }

        public static void banPlayer(this Player banPlayer, int time, string adminName, int accountId, string username, string reason, string characterName = null)
        {
            NAPI.Task.Run(async () =>
            {
                banPlayer.ResetData();

                banPlayer.SetCustomData(PlayersData._isBanned, true);

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    long minuteSeconds = time * 60;
                    long issueDateUnix = CommandUtils.generateUnix();
                    long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + minuteSeconds;

                    Ban ban = new Ban
                    {
                        account_id = accountId,
                        admin = adminName,
                        ban_reason = reason,
                        ip_address = banPlayer.Address,
                        lift_unix_time = lift_unix_time,
                        social_club_id = banPlayer.SocialClubId,
                        social_club_name = banPlayer.SocialClubName,
                        client_serial = banPlayer.Serial,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        issue_unix_date = issueDateUnix,
                        username = username
                    };

                    Account findAccount = dbContext.accounts.Find(accountId);

                    if (findAccount != null)
                    {
                        findAccount.ban_status = 1;
                        findAccount.auto_login = 0;
                        dbContext.Update(findAccount);
                    }

                    dbContext.Add(ban);
                    dbContext.SaveChanges();

                    banPlayer.setPlayerToBanScreen(ban);
                    uiHandling.toggleGui(banPlayer, false);

                    ChatUtils.formatConsolePrint($"{ban.username} was banned with lift time being {lift_unix_time}. Reason {reason}");

                    AdminPunishments.addNewPunishment(accountId, reason, adminName, PunishmentTypes.AdminBan, lift_unix_time);

                    string endOfBanString = lift_unix_time == -1 ? "is permanent" : "expires at <t:" + lift_unix_time + ">";
                    await Ban.sendBanWebhookMessageAsync($"{adminName} banned {(characterName != null ? characterName : username)} with reason ``{reason}`` ban {endOfBanString}.");
                }
            });
        }

        public static bool isBanned(this Player player)
        {
            return player.GetData<bool>(PlayersData._isBanned);
        }

        public static Ban checkPlayerIsBanned(this Player player)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Ban returnBanData = dbContext.bans.Where(ban =>
                        (ban.client_serial == player.Serial ||
                        ban.social_club_name == player.SocialClubName ||
                        ban.social_club_id == player.SocialClubId ||
                        ban.ip_address == player.Address) && ban.is_active)
                    .FirstOrDefault();

                Console.WriteLine("Ban " + JsonConvert.SerializeObject(returnBanData));

                if (returnBanData != null && returnBanData.lift_unix_time < CommandUtils.generateUnix() && returnBanData.lift_unix_time != -1)
                {
                    Account findUserAccount = dbContext.accounts.Find(returnBanData.account_id);

                    if (findUserAccount != null)
                    {
                        findUserAccount.ban_status = 0;
                        dbContext.accounts.Update(findUserAccount);
                    }

                    returnBanData.is_active = false;
                    dbContext.bans.Update(returnBanData);
                    dbContext.SaveChanges();
                    return null;
                }

                if (returnBanData != null)
                {
                    player.SetData(PlayersData._isBanned, true);
                    return returnBanData;
                }
                else return null;
            }
        }

        public static bool isImmuneTo(this Player target, Player player)
        {
            User targetData = target.getPlayerAccountData();
            User playerData = player.getPlayerAccountData();

            if (targetData != null && playerData != null && targetData.admin_status >= (int)AdminRanks.Admin_Developer && targetData.account_id != playerData.account_id && playerData.username != "unclemole")
            {
                CommandUtils.errorSay(player, "This player is immune to this command!");
                return true;
            }

            return false;
        }

        public static void setPlayerToBanScreen(this Player player, Ban banData)
        {
            player.safeSetDimension(Auth._startDimension);
            player.TriggerEvent("client:loginCameraStart");
            uiHandling.pushRouterToClient(player, Browsers.BanPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.BanData, banData);
            player.SetData(_atBanScreenIdentifier, true);
        }

        public static void addPlayerKey(this Player player, string usedKey)
        {
            List<string> usedKeys = new List<string>();

            if (player.GetData<List<string>>(PlayersData._playerKeysIdentifier) == null)
            {
                usedKeys.Add(usedKey);
                player.SetData(PlayersData._playerKeysIdentifier, usedKeys);
                return;
            }

            usedKeys = player.GetData<List<string>>(PlayersData._playerKeysIdentifier);

            if (usedKeys.Contains(usedKey))
            {
                usedKeys.Remove(usedKey);
            }

            usedKeys.Add(usedKey);
            player.SetData(PlayersData._playerKeysIdentifier, usedKeys);
        }

        public static void flushUserAndCharacterData(this Player player, string[] excludes = null)
        {
            if (player.GetData<List<string>>(PlayersData._playerKeysIdentifier) != null)
            {
                for (int i = 0; i < player.GetData<List<string>>(PlayersData._playerKeysIdentifier).Count; i++)
                {
                    string item = player.GetData<List<string>>(PlayersData._playerKeysIdentifier)[i];

                    if (!(excludes != null && excludes.Contains(item)))
                    {
                        player.ResetData(item);
                        player.ResetOwnSharedData(item);
                        player.ResetSharedData(item);
                    }

                }
            }

            if (excludes == null || excludes != null && excludes.Length == 0)
            {
                player.ResetData();
            }
        }

        public static bool checkIsWithinCoord(this Player player, Vector3 coord, float range)
        {
            return player.Position.DistanceToSquared(coord) < range;
        }
        
        public static bool checkIsWithinOneCoords(this Player player, List<Vector3> coords, float range)
        {
            bool isWithin = false;

            coords.ForEach(coord =>
            {
                if (player.Position.DistanceToSquared(coord) < range && !isWithin) isWithin = true;
            });

            return isWithin;
        }

        public static bool hasVip(this Player player)
        {
            bool hasVip = false;    

            User user = player.getPlayerAccountData();

            if(user != null && user.vip_status)
            {
                hasVip = true;
            }

            return hasVip;
        }
    }
}
