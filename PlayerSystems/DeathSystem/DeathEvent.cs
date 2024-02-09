using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using static CloudRP.ServerSystems.CustomEvents.KeyPressEvents;

namespace CloudRP.PlayerSystems.DeathSystem
{
    class DeathEvent : Script
    {
        public delegate void DeathEventEventHandler(Player player);
        public static event DeathEventEventHandler onDeath;
        public static List<Hospital> hospitalList = new List<Hospital> {
            new Hospital { name = "Strawberry Hospital", position = new Vector3(341.3, -1396.7, 32.5) },
            new Hospital { name = "Pillbox Hill Hospital Back", position = new Vector3(360.8, -585.3, 28.8) },
            new Hospital { name = "Pillbox Hill Hospital Front", position = new Vector3(297.7, -583.6, 43.3) },
            new Hospital { name = "Mount Zonah", position = new Vector3(-497.3, -336.3, 34.5) },
            new Hospital { name = "Sandy Hospital", position = new Vector3(1821.3, 3684.9, 34.3) },
            new Hospital { name = "Paleto Hospital", position = new Vector3(-381.1, 6119.7, 31.5) }
        };
        public static List<Corpse> corpses = new List<Corpse>();
        public static int _respawnTimeout_seconds = 3;
        public const int _deathTimer_seconds = 600;
        public static string corpseSharedKey = "corpsePed";
        public static int _pedTimeout_seconds = 300;

        public DeathEvent()
        {
            NAPI.Server.SetAutoRespawnAfterDeath(false);
            NAPI.Server.SetAutoSpawnOnConnect(false);

            foreach (Hospital hospital in hospitalList)
            {
                NAPI.Blip.CreateBlip(61, hospital.position, 1.0f, 49, hospital.name, 255, 20, true, 0, 0);
            }
        }

        #region Server Events
        [ServerEvent(Event.PlayerDeath)]
        public void OnPlayerDeath(Player player, Player killer, uint reason)
        {
            NAPI.Task.Run(() =>
            {
                User userData = player.getPlayerAccountData();

                if (userData != null && userData.adminDuty || player.isLoggingOut())
                {
                    NAPI.Player.SpawnPlayer(player, player.Position);
                    return;
                }

                DbCharacter characterData = player.getPlayerCharacterData();
                DbCharacter killerData = null;

                if (killer != null)
                {
                    killerData = killer.getPlayerCharacterData();
                }

                if (characterData != null)
                {
                    AdminUtils.sendMessageToAllStaff($"{characterData.character_name} [{player.Id}] was {(characterData.injured_timer > 0 ? "killed" : "injured")}{(killerData != null ? $" by {killerData.character_name} [{killer.Id}]" : "")}.", (int)AdminRanks.Admin_SeniorSupport);

                    if (characterData.injured_timer > 0)
                    {
                        resetTimer(player, characterData);
                        respawnAtHospital(player);
                    }
                    else
                    {
                        player.SendChatMessage(ChatUtils.info + $"You have been injured. You will bleed out in {(_deathTimer_seconds / 60).ToString("N0")} minutes. Upon death you will lose all inventory items and cash.");
                        updateAndSetInjuredState(player, characterData);
                    }
                }
            });
        }
        #endregion

        #region Global Methods
        public static void respawnAtHospital(Player player)
        {
            DbCharacter playerCharacterData = player.getPlayerCharacterData();

            if(playerCharacterData == null) return;

            onDeath(player);

            player.Dimension = 0;
            playerCharacterData.player_dimension = 0;
            playerCharacterData.injured_timer = 0;

            player.setPlayerCharacterData(playerCharacterData, false, true);

            player.TriggerEvent("client:moveSkyCamera", "up", 1, false);

            List<HosList> pDist = new List<HosList>();

            foreach (Hospital hospital in hospitalList)
            {
                float dist = Vector3.Distance(hospital.position, player.Position);

                pDist.Add(new HosList { dist = dist, hospital = hospital });
            }

            List<float> distList = new List<float>();

            pDist.ForEach(pdist =>
            {
                distList.Add(pdist.dist);
            });

            handleCorpseSet(player);
            distList.Sort();

            HosList closestHospital = pDist.FirstOrDefault(d => d.dist == distList[0]);

            NAPI.Player.SpawnPlayer(player, closestHospital.hospital.position);

            playerCharacterData.cash_amount = 0;
            player.setPlayerCharacterData(playerCharacterData, false, true);

            player.SendChatMessage(ChatUtils.hospital + "You recieved medial treatment at " + closestHospital.hospital.name);
            player.TriggerEvent("client:moveSkyCamera", "down");
            player.TriggerEvent("injured:removeStatus");
        }

        public static void updateAndSetInjuredState(Player player, DbCharacter characterData, int time = _deathTimer_seconds)
        {
            NAPI.Player.SpawnPlayer(player, player.Position);

            characterData.injured_timer = time;
            characterData.character_health = 100;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.characters.Update(characterData);
                dbContext.SaveChanges();
            }

            player.setPlayerCharacterData(characterData);

            player.TriggerEvent("injured:startInterval", time);
        }

        public static void removeInjuredStatus(Player player, DbCharacter character, bool respawn = true)
        {
            if (character == null) return;

            resetTimer(player, character);
            player.TriggerEvent("injured:removeStatus");

            if (respawn)
            {
                respawnAtHospital(player);
            }

        }

        public static void resetTimer(Player player, DbCharacter character)
        {
            character.injured_timer = 0;
            player.setPlayerCharacterData(character, false, true);
            player.TriggerEvent("injured:removeStatus");
        }

        public static void removeCorpse(Corpse corpse)
        {
            corpses.Remove(corpse);

            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            foreach (Player player in onlinePlayers.ToList())
            {
                player.TriggerEvent("corpse:removeCorpse", corpse.corpseId);
            }
        }

        public static void addCorpseToClients(Corpse corpse)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            foreach (Player onlinePlayer in onlinePlayers)
            {
                onlinePlayer.TriggerEvent("corpse:add", corpse);
            }
        }

        public static void initCorpses(Player player)
        {
            corpses.ForEach(corpse =>
            {
                player.TriggerEvent("corpse:add", corpse);
            });
        }

        public static void handleCorpseSet(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData == null) return;

            Corpse playerCorpse = new Corpse
            {
                characterName = characterData.character_name,
                model = characterData.characterModel,
                clothes = characterData.characterClothing,
                characterId = characterData.character_id,
                position = player.Position,
                unixCreated = CommandUtils.generateUnix()
            };

            corpses.Add(playerCorpse);

            playerCorpse.corpseId = corpses.IndexOf(playerCorpse);

            addCorpseToClients(playerCorpse);
        }
        #endregion

        #region Events
        [RemoteEvent("sync:corpseValidation")]
        public static void validatePed(Player player, int corpseId)
        {
            Corpse selectedCorpse = corpses
                .Where(corpse => corpse.corpseId == corpseId)
                .FirstOrDefault();

            if (selectedCorpse != null)
            {
                if (CommandUtils.generateUnix() - selectedCorpse.unixCreated > _pedTimeout_seconds)
                {
                    removeCorpse(selectedCorpse);
                }
            }

        }

        [RemoteEvent("server:saveInjuredTime")]
        public static void saveInjuredTime(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null || characterData != null && characterData.injured_timer == 0) return;

            if (characterData.injured_timer - 10 <= 0)
            {
                removeInjuredStatus(player, characterData);
                return;
            }

            characterData.injured_timer -= 10;
            player.setPlayerCharacterData(characterData, false, true);
        }
        #endregion
    }
}
