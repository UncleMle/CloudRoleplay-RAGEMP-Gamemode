using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace CloudRP.Character
{
    internal class CharacterSystem : Script
    {
        private static Timer saveCharactersTimer;
        private static int _timerInterval = 5000;

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            beginSaveInterval();
        }

        void beginSaveInterval()
        {
            Chat.charSysPrint("Began saving characters in main thread.");
            NAPI.Task.Run(() =>
            {
                saveCharactersTimer = new Timer();
                saveCharactersTimer.Interval = _timerInterval;
                saveCharactersTimer.Elapsed += saveCharacterPositions;

                saveCharactersTimer.AutoReset = true;
                saveCharactersTimer.Enabled = true;
            });
        }

        public static void saveCharacterPositions(object source, ElapsedEventArgs e)
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
        }

        public static void saveCharacterData(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                characterData.position_x = player.Position.X;
                characterData.position_y = player.Position.Y;
                characterData.position_z = player.Position.Z;
                characterData.character_health = player.Health;
                characterData.play_time_seconds += 5;
                characterData.player_exp += 1;

                dbContext.characters.Update(characterData);
                dbContext.SaveChanges();
            }
        }

        public static int getUsersCharacter(User userData)
        {
            List<DbCharacter> accounts;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                accounts = dbContext.characters.Where(acc => acc.character_id == userData.accountId).ToList();
            }

            return accounts.Count;
        }

        public static void addUserCharacterSlot(User userData)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account account = dbContext.accounts.Where(acc => acc.account_id == userData.accountId).FirstOrDefault();

                if(account != null)
                {
                    account.max_characters++;
                }

                dbContext.Update(account);
                dbContext.SaveChanges();
            }
        }

        [RemoteEvent("server:recieveCharacterModel")]
        public async Task saveCharacterModelAsync(Player player, string data)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            if (userData == null) return;

            int currentCharacters = getUsersCharacter(userData);

            if (currentCharacters >= userData.maxCharacters)
            {
                uiHandling.sendPushNotifError(player, "You already have the maximum amount of characters", 5600);
                return;
            }

            CharacterCreation characterModel = JsonConvert.DeserializeObject<CharacterCreation>(data);

            if(!AuthUtils.validateString(characterModel.fname) || !AuthUtils.validateString(characterModel.lname) || characterModel.fname.Length < 2 || characterModel.lname.Length < 2 || characterModel.lname.Length > 16 || characterModel.fname.Length > 16)
            {
                uiHandling.sendPushNotifError(player, "Ensure your firstname and lastname are valid (greater than 2 characters less than 16 and doesn't contain any special characters)", 4000);
                return;
            }

            string characterName = AuthUtils.firstCharToUpper(characterModel.fname) + "_" + AuthUtils.firstCharToUpper(characterModel.lname);

            if(!AuthUtils.checkCharacterName(characterName))
            {
                uiHandling.sendPushNotifError(player, "This character name is already taken.", 7500);
                return;
            }

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
                owner_id = userData.accountId
            };

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.characters.Add(newCharacter);
                dbContext.SaveChanges();

                createdCharacterModel.owner_id = newCharacter.character_id;

                dbContext.character_models.Add(createdCharacterModel);
                dbContext.SaveChanges();
            }

            player.TriggerEvent("client:setBackToSelection");

            uiHandling.pushRouterToClient(player, Browsers.LoginPage);

            fillCharacterSelectionTable(player, userData);
        }

        [RemoteEvent("server:setUserToCharacterCreation")]
        public static void setUserToCharacterCreation(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            if(userData == null) return;

            int currentCharacters = getUsersCharacter(userData);

            if(currentCharacters >= userData.maxCharacters)
            {
                uiHandling.sendPushNotifError(player, "You already have the maximum amount of characters", 5600);
                return;
            }

            player.TriggerEvent("client:setCharacterCreation");

        }

        public static void fillCharacterSelectionTable(Player player, User userData)
        {
            string mutationName = "setCharacterSelection";

            uiHandling.sendMutationToClient(player, mutationName, "toggle", true);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<DbCharacter> allPlayerCharacters = dbContext.characters.Where(character => character.owner_id == userData.accountId).ToList();

                allPlayerCharacters.ForEach(character =>
                {
                    uiHandling.handleObjectUiMutationPush(player, MutationKeys.PlayerCharacters, character);
                });
            }
        }
    }
}
