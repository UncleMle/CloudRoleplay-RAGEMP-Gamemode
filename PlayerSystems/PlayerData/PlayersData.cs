using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.Character;
using CloudRP.ServerSystems.Utils;
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

namespace CloudRP.PlayerSystems.PlayerData
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
                if (p.getPlayerCharacterData() != null && p.getPlayerCharacterData().character_id == charId)
                {
                    onlineChars.Add(p.getPlayerCharacterData());
                }
            });

            if (onlineChars.Count > 1)
            {
                wasFound = true;
            }

            return wasFound;
        }

        public static void SetCustomData<T>(this Player player, string key, T val)
        {
            if (player.checkDataSetIsValid())
            {
                Console.WriteLine(val.GetType().Name);
                if (key != null && (key == _sharedAccountDataIdentifier && checkIfAccountIsLogged((val as User).account_id) || key == _sharedCharacterDataIdentifier && checkIfCharacterIsLogged((val as DbCharacter).character_id)))
                {
                    ChatUtils.formatConsolePrint($"[ServerData] Duplicate key error. Key: " + key, ConsoleColor.Red);
                    return; 
                }

                player.addPlayerKey(key);
                player.SetData(key, val);
            }
        }

        public static void SetCustomSharedData<T>(this Player player, string key, T val)
        {
            if (player.checkDataSetIsValid())
            {
                Console.WriteLine(val.GetType().Name);
                
                if (key != null && (key == _sharedAccountDataIdentifier && checkIfAccountIsLogged((val as SharedDataAccount).account_id) || key == _sharedCharacterDataIdentifier && checkIfCharacterIsLogged((val as SharedDataCharacter).character_id)))
                {
                    ChatUtils.formatConsolePrint($"[Shared] Duplicate key error. Key: " + key, ConsoleColor.Red);
                    return;
                }

                player.addPlayerKey(key);
                player.SetSharedData(key, val);
            }
        }

        public static bool checkDataSetIsValid(this Player player)
        {
            bool isValid = true;

            if (player.GetData<bool>(Commands._logoutIdentifier))
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
                if (p.getPlayerAccountData() != null && p.getPlayerAccountData().account_id == accId)
                {
                    onlineAccounts.Add(p.getPlayerAccountData());
                }
            });

            if (onlineAccounts.Count > 1)
            {
                wasFound = true;
            }

            return wasFound;
        }
    }
}
