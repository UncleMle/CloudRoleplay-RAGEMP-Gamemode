using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public static class PlayerExtensions
    {
        public static List<Factions> getPlayerFactions(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || character.character_faction_data == null) return null;

            return JsonConvert.DeserializeObject<List<Factions>>(character.character_faction_data);
        }

        public static void addPlayerFaction(this Player player, Factions faction)
        {
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            List<Factions> factions = new List<Factions>();

            if(character.character_faction_data != null)
            {
                factions = JsonConvert.DeserializeObject<List<Factions>>(character.character_faction_data);
            }

            if (factions.Contains(faction)) return;

            factions.Add(faction);

            character.character_faction_data = JsonConvert.SerializeObject(factions);
            player.setPlayerCharacterData(character, false, true);
        }

        public static bool isPartOfFaction(this Player player, Factions compareFaction, bool checkForDuty = false)
        {
            bool isPart = false;

            List<Factions> playerFactions = player.getPlayerFactions();
            DbCharacter character = player.getPlayerCharacterData();

            if(playerFactions != null && character != null && playerFactions.Contains(compareFaction))
            {
                if(checkForDuty && character.faction_duty_status != (int)compareFaction)
                {
                    uiHandling.sendPushNotifError(player, "You must be on faction duty to use this.", 6500);
                }

                if(checkForDuty && character.faction_duty_status == (int)compareFaction)
                {
                    isPart = true;
                }
                else if(!checkForDuty)
                {
                    isPart = true;
                }
            }
            return isPart;
        }

        public static void setFactionDuty(this Player player, Factions faction)
        {
            DbCharacter character = player.getPlayerCharacterData();

            character.faction_duty_status = (int)faction;
            player.setPlayerCharacterData(character, false, true);
        }

        public static void setFactionUniform(this Player player, FactionUniform uniform)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            character.characterClothing = uniform.uniform;
            character.faction_duty_uniform = uniform.uniformId;

            player.setPlayerCharacterData(character, true, false);
        }

        public static bool hasFactionRank(this Player player, int rankId)
        {
            bool has = false;

            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return false;

            List<DbFactionRank> ranks = JsonConvert.DeserializeObject<List<DbFactionRank>>(character.faction_ranks);

            if(ranks.Where(rank => rank.rankId == rankId).FirstOrDefault() != null)
            {
                has = true;
            }

            return has;
        }
        
        public static void addFactionRank(this Player player, Factions faction, int rankId)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            if (player.hasFactionRank(rankId) || !player.isPartOfFaction(faction)) return;

            List<DbFactionRank> ranks = JsonConvert.DeserializeObject<List<DbFactionRank>>(character.faction_ranks);

            ranks.Add(new DbFactionRank
            {
                faction = (int)faction,
                rankId = rankId
            });

            character.faction_ranks = JsonConvert.SerializeObject(ranks);
            player.setPlayerCharacterData(character, false, true);
        }

        public static List<DbFactionRank> getFactionRanks(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if(character == null) return null;

            List<DbFactionRank> ranks = JsonConvert.DeserializeObject<List<DbFactionRank>>(character.faction_ranks);

            return ranks;
        }

        public static FactionRank getFactionRankViaFaction(this Player player, Factions faction)
        {
            FactionRank rank = null;
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return rank;

            List<DbFactionRank> ranks = player.getFactionRanks();

            int targetRankId = -1;

            ranks.ForEach(rank =>
            {
                if(rank.faction == (int)faction)
                {
                    targetRankId = rank.rankId;
                }
            });

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                rank = dbContext.faction_ranks.Find(targetRankId);
            }

            return rank;
        }

    }
}
