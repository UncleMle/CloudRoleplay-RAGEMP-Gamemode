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
    internal class PlayersData : Script
    {
        public static readonly Vector3 defaultSpawnPosition = new Vector3(-1036.6, -2736.0, 13.8);

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
