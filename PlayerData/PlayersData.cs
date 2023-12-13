using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerData
{
    internal class PlayersData : Script
    {
        public static readonly Vector3 defaultSpawnPosition = new Vector3(-1036.6, -2736.0, 13.8);
        private static readonly string _sharedAccountDataIdentifier = "PlayerAccountData";
        private static readonly string _sharedCharacterDataIdentifier = "PlayerCharacterData";
        private static readonly string _characterModelData = "PlayerCharacterModelData";
        private static string _characterFoodAndWaterKey = "characterWaterAndHunger";
        private static string _characterClothesKey = "characterClothing";

        public static void setPlayerAccountData(Player player, User userData)
        {
            player.SetData(_sharedAccountDataIdentifier, userData);

            // Explicitly specify data as it will be sent freely to other clients
            SharedDataAccount data = new SharedDataAccount
            {
                accountId = userData.accountId,
                adminDuty = userData.adminDuty,
                adminLevel = userData.adminLevel,
                adminName = userData.adminName,
                adminPed = userData.adminPed,
                showAdminPed = userData.showAdminPed,
                playerId = userData.playerId,
                username = userData.username,
                isFlying = userData.isFlying,
                isFrozen = userData.isFrozen,
                adminEsp = userData.adminEsp
            };

            player.SetSharedData(_sharedAccountDataIdentifier, data);
        }

        public static void setPlayerCharacterData(Player player, DbCharacter character, bool resyncModel = true, bool updateDb = false)
        {
            player.SetData(_sharedCharacterDataIdentifier, character);

            // Explicitly specify data as it will be sent freely to other clients
            SharedDataCharacter data = new SharedDataCharacter
            {
                characterId = character.character_id,
                characterName = character.character_name,
                characterModel = resyncModel ? character.characterModel : null,
                characterTats = resyncModel ? character.player_tattoos : null,
                voiceChatState = character.voiceChatState,
                data = character,
                characterClothing = character.characterClothing
            };

            setCharacterHungerAndThirst(player, character.character_hunger, character.character_water);
            setCharacterClothes(player, character.characterClothing);

            player.SetData(_characterModelData, character.characterModel);
            player.SetSharedData(_sharedCharacterDataIdentifier, data);

            if (updateDb)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.Update(character);
                    dbContext.SaveChanges();
                }
            }
        }

        public static void setCharacterHungerAndThirst(Player player, double hunger, double water)
        {
            player.SetSharedData(_characterFoodAndWaterKey, new HungerThirst
            {
                hunger = hunger,
                water = water
            });
        }
        
        public static void setCharacterClothes(Player player, CharacterClothing clothes)
        {
            player.SetSharedData(_characterClothesKey, clothes);
        }

        public static CharacterModel getCharacterModelData(Player player)
        {
            CharacterModel characterModel = player.GetData<CharacterModel>(_characterModelData);

            return characterModel;
        }

        public static User getPlayerAccountData(Player player)
        {
            User playerData = player.GetData<User>(_sharedAccountDataIdentifier);
            return playerData;
        }

        public static DbCharacter getPlayerCharacterData(Player player)
        {
            DbCharacter character= player.GetData<DbCharacter>(_sharedCharacterDataIdentifier);
            return character;
        }

        public static void flushUserAndCharacterData(Player player)
        {
            player.SetData<User>(_sharedAccountDataIdentifier, null);
            player.SetData<DbCharacter>(_sharedCharacterDataIdentifier, null);
            player.SetData<CharacterModel>(_characterModelData, null);
            player.ResetData();

            player.ResetOwnSharedData(_sharedAccountDataIdentifier);
            player.ResetOwnSharedData(_sharedCharacterDataIdentifier);
        }
    }
}
