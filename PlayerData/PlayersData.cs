using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerData
{
    internal class PlayersData : Script
    {
        private static readonly string _sharedAccountDataIdentifier = "PlayerAccountData";
        private static readonly string _sharedCharacterDataIdentifier = "PlayerCharacterData";

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
                playerId = userData.playerId,
                username = userData.username,
                isFlying = userData.isFlying,
                isFrozen = userData.isFrozen,
            };

            player.SetSharedData(_sharedAccountDataIdentifier, data);
        }

        public static void setPlayerCharacterData(Player player, DbCharacter character)
        {
            player.SetData(_sharedCharacterDataIdentifier, character);

            // Explicitly specify data as it will be sent freely to other clients
            SharedDataCharacter data = new SharedDataCharacter
            {
                characterId = character.character_id,
                characterName = character.character_name,
            };

            player.SetSharedData(_sharedCharacterDataIdentifier, data);
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
            player.ResetData();

            player.ResetOwnSharedData(_sharedAccountDataIdentifier);
            player.ResetOwnSharedData(_sharedCharacterDataIdentifier);
        }
    }
}
