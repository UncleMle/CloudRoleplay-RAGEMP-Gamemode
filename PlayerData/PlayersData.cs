using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.Utils;
using Discord;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Xml.Schema;

namespace CloudRP.PlayerData
{
    public static class PlayersData
    {
        public static readonly Vector3 defaultSpawnPosition = new Vector3(-1036.6, -2736.0, 13.8);
        public static readonly Vector3 defaultLoginPosition = new Vector3(0, 0, 0);

        public static readonly string _playerKeysIdentifier = "AllPlayerKeys";
        public static readonly string _isBanned = "playerIsBanned";
        public static readonly string _sharedAccountDataIdentifier = "PlayerAccountData";
        public static readonly string _sharedCharacterDataIdentifier = "PlayerCharacterData";
        public static string _characterFoodAndWaterKey = "characterWaterAndHunger";
        public static string _characterClothesKey = "characterClothing";
        public static string _voipStatusKey = "voipIsTalking";
        public static string _characterModelKey = "characterModel";

        public static bool checkIfCharacterIsLogged(int charId)
        {
            bool wasFound = false;

            List<DbCharacter> onlineChars = new List<DbCharacter>();

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if(p.getPlayerCharacterData() != null && p.getPlayerCharacterData().character_id == charId)
                {
                    onlineChars.Add(p.getPlayerCharacterData());
                }
            });

            if(onlineChars.Count > 1)
            {
                wasFound = true;
            }

            return wasFound;
        }

        public static void SetCustomData<T>(this Player player, string key, T val)
        {
            if (player.checkDataSetIsValid())
            {
                player.addPlayerKey(key);
                player.SetData(key, val);
            }
        }

        public static void SetCustomSharedData<T>(this Player player, string key, T val)
        {
            player.addPlayerKey(key);
            player.SetSharedData(key, val);
        }

        public static bool checkDataSetIsValid(this Player player)
        {
            bool isValid = true;

            DbCharacter characterData = player.getPlayerCharacterData();

            if(characterData != null && characterData.loggingOut)
            {
                isValid = false;
            }

            return isValid;
        }

        public static bool checkIfAccountIsLogged(int accId)
        {
            bool wasFound = false;

            List<User> onlineAccounts = new List<User>();

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if(p.getPlayerCharacterData() != null && p.getPlayerAccountData().account_id == accId)
                {
                    onlineAccounts.Add(p.getPlayerAccountData());
                }
            });

            if(onlineAccounts.Count > 1)
            {
                wasFound = true;
            }

            return wasFound;
        }
    }
}
