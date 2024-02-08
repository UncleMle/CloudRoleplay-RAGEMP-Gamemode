using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public static class PlayerExtensions
    {
        public static readonly string _FactionSystemSharedDutyKey = "factionSystem:dutyStatus:key";

        public static List<Factions> getPlayerFactions(this Player player)
        {
            List<Factions> factions = new List<Factions>();
            DbCharacter character = player.getPlayerCharacterData();

            if (character != null && character.character_faction_data != null)
            {
                factions = JsonConvert.DeserializeObject<List<Factions>>(character.character_faction_data);
            }

            return factions;
        }

        public static void addPlayerFaction(this Player player, Factions faction)
        {
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            List<Factions> factions = new List<Factions>();

            if (character.character_faction_data != null)
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

            if (playerFactions != null && character != null && playerFactions.Contains(compareFaction))
            {
                if (checkForDuty && character.faction_duty_status != (int)compareFaction)
                {
                    uiHandling.sendPushNotifError(player, "You must be on faction duty to use this.", 6500);
                }

                if (checkForDuty && character.faction_duty_status == (int)compareFaction)
                {
                    isPart = true;
                }
                else if (!checkForDuty)
                {
                    isPart = true;
                }
            }
            return isPart;
        }

        public static void setFactionDuty(this Player player, Factions faction)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            character.faction_duty_status = (int)faction;
            player.setPlayerCharacterData(character, false, true);
        }

        public static void setOffFactionDuty(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || character != null && character.faction_duty_status == -1) return;

            character.faction_duty_status = -1;
            character.faction_duty_uniform = -1;

            character.characterClothing = CharacterSystem.getClothingViaCharacterId(character.character_id);

            player.setPlayerCharacterData(character, true);
            FactionSystem.clearTracker(player);

            uiHandling.resetRouter(player);

            uiHandling.sendNotification(player, "Your now ~r~off~w~ faction duty.", false);
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

            if (ranks.Where(rank => rank.rankId == rankId).FirstOrDefault() != null)
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

            if (character == null) return null;

            List<DbFactionRank> ranks = JsonConvert.DeserializeObject<List<DbFactionRank>>(character.faction_ranks);

            return ranks;
        }

        public static bool hasFactionPermission(this Player player, Factions faction, GeneralRankPerms perm)
        {
            bool hasPermission = false;

            List<DbFactionRank> ranks = player.getFactionRanks();

            DbFactionRank rank = ranks.Where(r => r.faction == (int)faction)
                .FirstOrDefault();

            if (rank != null)
            {
                RankPermissions perms = FactionSystem.getAllowedItemsFromRank(rank.rankId);

                if (perms == null) return false;

                if (perms.general.Contains((int)perm)) hasPermission = true; 
            }

            return hasPermission;
        }

        public static DbFactionRank getOnDutyRank(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();
            List<DbFactionRank> ranks = player.getFactionRanks();
            DbFactionRank targetRank = null;

            if(character != null)
            {
                ranks.ForEach(rank =>
                {
                    if(rank.faction == character.faction_duty_status)
                    {
                        targetRank = rank;
                    }
                });
            }

            return targetRank;
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
