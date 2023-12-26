using CloudRP.Admin;
using CloudRP.AntiCheat;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CloudRP.DeathSystem
{
    class DeathEvent : Script
    {
        public static List<Hospital> hospitalList = new List<Hospital>();
        public static List<Corpse> corpses = new List<Corpse>();
        public static int _respawnTimeout_seconds = 3;
        public const int _deathTimer_seconds = 600;
        public static string corpseSharedKey = "corpsePed";
        public static int _pedTimeout_seconds= 300;

        [ServerEvent(Event.ResourceStart)]
        public void initEvents()
        {
            hospitalList.Add(new Hospital { name = "South LS Hospital", position = new Vector3(342.3, -1397.5, 32.5) });
            hospitalList.Add(new Hospital { name = "Pillbox Hill Hospital Back", position = new Vector3(360.8, -585.3, 28.8) });
            hospitalList.Add(new Hospital { name = "Pillbox Hill Hospital Front", position = new Vector3(297.7, -583.6, 43.3) });
            hospitalList.Add(new Hospital { name = "Mount Zonah", position = new Vector3(-497.3, -336.3, 34.5) });
            hospitalList.Add(new Hospital { name = "Sandy Hospital", position = new Vector3(1821.3, 3684.9, 34.3) });
            hospitalList.Add(new Hospital { name = "Paleto Hospital", position = new Vector3(-381.1, 6119.7, 31.5) });

            NAPI.Server.SetAutoRespawnAfterDeath(false);
            NAPI.Server.SetAutoSpawnOnConnect(false);

            ChatUtils.formatConsolePrint(ChatUtils._c_Hospital + "Disabled auto respawn and loaded hospitals", ConsoleColor.DarkCyan);

            foreach(Hospital hospital in hospitalList)
            {
                NAPI.Blip.CreateBlip(61, hospital.position, 1.0f, 49, hospital.name, 255, 20, true, 0, 0);
            }
        }

        [ServerEvent(Event.PlayerDeath)]
        public void OnPlayerDeath(Player player, Player killer, uint reason)
        {
            NAPI.Task.Run(() =>
            {
                User userData = PlayersData.getPlayerAccountData(player);

                if (userData != null && userData.adminDuty)
                {
                    NAPI.Player.SpawnPlayer(player, player.Position);
                    return;
                }

                DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
                DbCharacter killerData = null;

                if (killer != null)
                {
                    killerData = PlayersData.getPlayerCharacterData(killer);
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
                        NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.info + "You have been injured.");
                        updateAndSetInjuredState(player, characterData);
                    }
                }
            });
        }

        public static void respawnAtHospital(Player player)
        {
            DbCharacter playerCharacterData = PlayersData.getPlayerCharacterData(player);

            if (playerCharacterData != null)
            {
                player.Dimension = 0;
                playerCharacterData.player_dimension = 0;

                PlayersData.setPlayerCharacterData(player, playerCharacterData, false, true);
            }

            player.TriggerEvent("client:moveSkyCamera", "up", 1, false);

            Dictionary<float, Hospital> pDist = new Dictionary<float, Hospital>();

            foreach (Hospital hospital in hospitalList)
            {
                float dist = Vector3.Distance(hospital.position, player.Position);
                
                pDist.Add(dist, hospital);
            }

            List<float> distList = new List<float>(pDist.Keys);

            handleCorpseSet(player);

            distList.Sort();

            AntiCheatSystem.sleepClient(player);

            Hospital closestHospital = pDist.GetValueOrDefault(distList[0]);

            NAPI.Player.SpawnPlayer(player, closestHospital.position);

            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.hospital + "You recieved medial treatment at " + closestHospital.name);
            player.TriggerEvent("client:moveSkyCamera", "down");
        }

        public static void updateAndSetInjuredState(Player player, DbCharacter characterData, int time = _deathTimer_seconds)
        {
            NAPI.Player.SpawnPlayer(player, player.Position);

            characterData.injured_timer = time;
            characterData.character_health = 100;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.characters.Update(characterData);
                dbContext.SaveChanges();
            }

            PlayersData.setPlayerCharacterData(player, characterData);

            player.TriggerEvent("injured:startInterval", time);
        }

        [RemoteEvent("server:saveInjuredTime")]
        public static void saveInjuredTime(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            if (characterData == null) return;

            if(characterData.injured_timer - 10 <= 0)
            {
                removeInjuredStatus(player, characterData);
                return;
            }

            characterData.injured_timer -= 10;
            PlayersData.setPlayerCharacterData(player, characterData, false, true);
        }

        public static void removeInjuredStatus(Player player, DbCharacter character, bool respawn = true)
        {
            if (character == null) return;

            resetTimer(player, character);
            player.TriggerEvent("injured:removeStatus");

            if(respawn)
            {
                respawnAtHospital(player);
            }

        }

        public static void resetTimer(Player player, DbCharacter character)
        {
            character.injured_timer = 0;
            PlayersData.setPlayerCharacterData(player, character, false, true);
            player.TriggerEvent("injured:removeStatus");
        }

        public static void removeCorpse(Corpse corpse)
        {
            corpses.Remove(corpse);

            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            foreach(Player player in onlinePlayers.ToList())
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

        [RemoteEvent("sync:corpseValidation")]
        public static void validatePed(Player player, int corpseId)
        {
            Corpse selectedCorpse = corpses
                .Where(corpse => corpse.corpseId == corpseId)
                .FirstOrDefault();

            if (selectedCorpse != null)
            {
                if((CommandUtils.generateUnix() - selectedCorpse.unixCreated) > _pedTimeout_seconds)
                {
                    removeCorpse(selectedCorpse);
                }
            }

        }

        public static void handleCorpseSet(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

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

    }
}
