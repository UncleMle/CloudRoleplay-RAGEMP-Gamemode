using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleDealerships;
using Discord;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;

namespace CloudRP.PlayerSystems.Character
{
    internal class CharacterSystem : Script
    {
        private static Timer saveCharactersTimer;
        private static int _timerInterval = 5000;
        private static double _characterHungerRemover = 0.004;
        private static double _characterWaterRemover = 0.009;

        public CharacterSystem()
        {
            NAPI.Task.Run(() =>
            {
                saveCharactersTimer = new Timer();
                saveCharactersTimer.Interval = _timerInterval;
                saveCharactersTimer.Elapsed += saveCharData;

                saveCharactersTimer.AutoReset = true;
                saveCharactersTimer.Enabled = true;
            });
        }

        public static void saveCharData(object source, ElapsedEventArgs e)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            foreach (Player player in onlinePlayers)
            {
                saveCharacterData(player);
            }
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void onPlayerDisconect(Player player, DisconnectionType type, string reason)
        {
            saveCharacterData(player);

            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData != null)
            {
                DiscordUtils.creationConnection(player, characterData, LogCreation.Leave);
            }

        }

        public static void saveCharacterData(Player player)
        {
            NAPI.Task.Run(() =>
            {
                Vector3 pos = player.Position;
                Vector3 checkPos = PlayersData.defaultLoginPosition;

                if (player.checkForLoginCheat())
                {
                    if (!player.isBanned())
                    {
                        player.banPlayer(-1, new User
                        {
                            admin_name = "[System]",
                        }, new User
                        {
                            username = "N/A",
                            account_id = -1,
                        }, "Exploits / Cheats [System]");

                        AdminUtils.sendMessageToAllStaff($"A player with ID {player.Id} was banned for evading login screen.", (int)AdminRanks.Admin_SeniorSupport, true);
                        return;
                    }
                }

                User userData = player.getPlayerAccountData();
                DbCharacter characterData = player.getPlayerCharacterData();
                bool vehicleDealerActive = player.GetData<bool>(VehicleDealershipSystem._dealerActiveIdentifier);

                if (vehicleDealerActive || userData == null || characterData == null) return;

                checkForDups(characterData.character_name);

                if (NAPI.Player.IsPlayerConnected(player))
                {
                    try
                    {
                        using (DefaultDbContext dbContext = new DefaultDbContext())
                        {
                            characterData.position_x = pos.X;
                            characterData.position_y = pos.Y;
                            characterData.position_z = pos.Z;
                            characterData.character_health = player.Health;
                            characterData.play_time_seconds += 5;
                            characterData.player_exp += 1;
                            characterData.last_login = DateTime.Now;

                            if (characterData.injured_timer == 0 && !userData.adminDuty && (characterData.character_hunger - _characterHungerRemover > 0 || characterData.character_water - _characterWaterRemover > 0))
                            {
                                if (characterData.character_water > 0 && characterData.character_water - _characterWaterRemover > 0)
                                {
                                    characterData.character_water -= _characterWaterRemover;
                                }

                                if (characterData.character_hunger > 0 && characterData.character_hunger - _characterHungerRemover > 0)
                                {
                                    characterData.character_hunger -= _characterHungerRemover;
                                }

                                player.setCharacterHungerAndThirst(characterData.character_hunger, characterData.character_water);
                            }

                            dbContext.characters.Update(characterData);
                            dbContext.SaveChanges();
                        }
                    }
                    catch
                    {
                    }
                }
            });
        }

        public static void checkForDups(string charName)
        {
            Dictionary<Player, DbCharacter> onlineChars = new Dictionary<Player, DbCharacter>();

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter charData = p.getPlayerCharacterData();

                if (charData != null && charData.character_name == charName)
                {
                    onlineChars.Add(p, charData);
                }
            });

            if (onlineChars.Count > 1)
            {
                foreach (var item in onlineChars)
                {
                    item.Key.Kick();
                }
            }
        }

        public static int getUsersCharacter(User userData)
        {
            List<DbCharacter> characters;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                characters = dbContext.characters.Where(acc => acc.owner_id == userData.account_id).ToList();
            }

            return characters.Count;
        }

        public static void addUserCharacterSlot(User userData)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account account = dbContext.accounts.Where(acc => acc.account_id == userData.account_id).FirstOrDefault();

                if (account != null)
                {
                    account.max_characters++;
                }

                dbContext.Update(account);
                dbContext.SaveChanges();
            }
        }

        [RemoteEvent("server:recieveCharacterModel")]
        public void saveCharacterModelAsync(Player player, string data)
        {
            User userData = player.getPlayerAccountData();
            if (userData == null) return;

            int currentCharacters = getUsersCharacter(userData);

            if (currentCharacters >= userData.max_characters)
            {
                uiHandling.sendPushNotifError(player, "You already have the maximum amount of characters", 5600);
                return;
            }

            CharacterCreation characterModel = JsonConvert.DeserializeObject<CharacterCreation>(data);

            if (!AuthUtils.validateString(characterModel.fname) || !AuthUtils.validateString(characterModel.lname) || characterModel.fname.Length < 2 || characterModel.lname.Length < 2 || characterModel.lname.Length > 16 || characterModel.fname.Length > 16)
            {
                uiHandling.sendPushNotifError(player, "Ensure your firstname and lastname are valid (greater than 2 characters less than 16 and doesn't contain any special characters)", 4000);
                return;
            }

            string characterName = AuthUtils.firstCharToUpper(characterModel.fname) + "_" + AuthUtils.firstCharToUpper(characterModel.lname);

            if (!AuthUtils.checkCharacterName(characterName))
            {
                uiHandling.sendPushNotifError(player, "This character name is already taken.", 7500);
                return;
            }

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                CharacterModel createdCharacterModel = JsonConvert.DeserializeObject<CharacterModel>(JsonConvert.SerializeObject(characterModel.model));

                DbCharacter newCharacter = new DbCharacter
                {
                    character_health = 100,
                    character_isbanned = 0,
                    character_name = characterName,
                    CreatedDate = DateTime.Now,
                    last_login = DateTime.Now,
                    player_dimension = 0,
                    player_exp = 0,
                    UpdatedDate = DateTime.Now,
                    owner_id = userData.account_id
                };

                dbContext.characters.Add(newCharacter);
                dbContext.SaveChanges();

                /* 
                ** For some reason this is the only way I could get the outfit to work without the keys duplicating.
                *  Data referenced outside of the scope will have a random chance of keys getting duplicating.
                * Seems to be some bug within the version of EF Core used.
                */

                dbContext.character_clothes.Add(
                createdCharacterModel.sex ? new CharacterClothing
                {
                    character_id = newCharacter.character_id,
                    mask = 0,
                    mask_texture = 0,
                    torso = 6,
                    leg = 1,
                    leg_texture = 0,
                    bags = 0,
                    bag_texture = 0,
                    shoes = 6,
                    shoes_texture = 0,
                    access = 0,
                    access_texture = 0,
                    undershirt = 8,
                    undershirt_texture = 0,
                    armor = 0,
                    decals = 0,
                    decals_texture = 0,
                    top = 7,
                    top_texture = 1,
                    armor_texture = 0,
                    torso_texture = 0
                } : new CharacterClothing
                {
                    character_id = newCharacter.character_id,
                    mask = 0,
                    mask_texture = 0,
                    torso = 2,
                    leg = 6,
                    leg_texture = 0,
                    bags = 0,
                    bag_texture = 0,
                    shoes = 1,
                    shoes_texture = 0,
                    access = 0,
                    access_texture = 0,
                    undershirt = -1,
                    undershirt_texture = 0,
                    armor = 0,
                    decals = 0,
                    decals_texture = 0,
                    top = 38,
                    top_texture = 2,
                    armor_texture = 0,
                    torso_texture = 0
                });

                dbContext.SaveChanges();

                CharacterUtils.createCharModel(newCharacter.character_id, createdCharacterModel);
                uiHandling.setLoadingState(player, false);

                player.TriggerEvent("client:setBackToSelection");
                uiHandling.pushRouterToClient(player, Browsers.LoginPage);
                fillCharacterSelectionTable(player, userData);
            }
        }

        [RemoteEvent("server:setUserToCharacterCreation")]
        public static void setUserToCharacterCreation(Player player)
        {
            User userData = player.getPlayerAccountData();
            if (userData == null) return;

            int currentCharacters = getUsersCharacter(userData);

            if (currentCharacters >= userData.max_characters)
            {
                uiHandling.sendPushNotifError(player, "You already have the maximum amount of characters", 5600);
                return;
            }
            player.TriggerEvent("client:setCharacterCreation");
        }

        public static void fillCharacterSelectionTable(Player player, User userData)
        {
            uiHandling.resetMutationPusher(player, MutationKeys.PlayerCharacters);
            uiHandling.resetMutationPusher(player, MutationKeys.PlayerAccountData);

            uiHandling.sendMutationToClient(player, "setCharacterSelection", "toggle", true);
            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerAccountData, userData);

            uiHandling.setAuthState(player, AuthStates.characterSelection);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<DbCharacter> allPlayerCharacters = dbContext.characters
                    .Where(character => character.owner_id == userData.account_id)
                    .ToList();

                allPlayerCharacters.ForEach(character =>
                {
                    uiHandling.handleObjectUiMutationPush(player, MutationKeys.PlayerCharacters, character);
                });
            }
        }

        public static void resetToCharacterModel(Player player)
        {
            if (player.getPlayerCharacterData() != null)
            {
                CharacterModel characterModelData = player.getPlayerCharacterData().characterModel;
                if (characterModelData == null) return;
                DbCharacter character = player.getPlayerCharacterData();
                if (character == null) return;

                character.characterModel = characterModelData;

                player.setPlayerCharacterData(character);
            }
        }
    }
}
