using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using static CloudRP.ServerSystems.CustomEvents.KeyPressEvents;

namespace CloudRP.PlayerSystems.DeathSystem
{
    class DeathEvent : Script
    {
        public delegate void DeathEventEventHandler(Player player);
        public static event DeathEventEventHandler onDeath;
        public static List<Corpse> corpses = new List<Corpse>();
        public static int _respawnTimeout_seconds = 3;
        public const int _deathTimer_seconds = 600;
        public static string corpseSharedKey = "corpsePed";
        public static int _pedTimeout_seconds = 300;
        public static Dictionary<int, Timer> injuredTimers = new Dictionary<int, Timer>();

        public static List<Hospital> hospitalList = new List<Hospital> {
            new Hospital { name = "Strawberry Hospital", position = new Vector3(341.3, -1396.7, 32.5) },
            new Hospital { name = "Pillbox Hill Hospital Back", position = new Vector3(360.8, -585.3, 28.8) },
            new Hospital { name = "Pillbox Hill Hospital Front", position = new Vector3(297.7, -583.6, 43.3) },
            new Hospital { name = "Mount Zonah", position = new Vector3(-497.3, -336.3, 34.5) },
            new Hospital { name = "Sandy Hospital", position = new Vector3(1821.3, 3684.9, 34.3) },
            new Hospital { name = "Paleto Hospital", position = new Vector3(-381.1, 6119.7, 31.5) }
        };

        class RaycastMenuOptions
        {
            public const string painKillerPurchase = "Purchase Painkiller";
            public const string bandagePurchase = "Purchase Bandages";
        }

        public DeathEvent()
        {
            Main.playerDisconnect += removeServerInjuredTimer;
            Commands.loggingOut += (player, character) => removeServerInjuredTimer(player);

            NAPI.Server.SetAutoRespawnAfterDeath(false);
            NAPI.Server.SetAutoSpawnOnConnect(false);

            foreach (Hospital hospital in hospitalList)
            {
                RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                {
                    menuTitle = hospital.name,
                    raycastMenuItems = new List<string> { RaycastMenuOptions.painKillerPurchase, RaycastMenuOptions.bandagePurchase },
                    raycastMenuPosition = hospital.position,
                    targetMethod = purchaseFromHospital
                });

                NAPI.Blip.CreateBlip(61, hospital.position, 1.0f, 49, hospital.name, 255, 20, true, 0, 0);
            }

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {hospitalList.Count} hospitals were loaded.");
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

                if(userData.admin_jail_time > 0)
                {
                    NAPI.Player.SpawnPlayer(player, AdminSystem.adminJailLocation);
                    return;
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
        public static void purchaseFromHospital(Player player, string raycastMenuOption)
        {
            switch(raycastMenuOption)
            {
                case RaycastMenuOptions.painKillerPurchase:
                    {

                        break;
                    }
                case RaycastMenuOptions.bandagePurchase:
                    {

                        break;
                    }
            }
        }

        public static void respawnAtHospital(Player player)
        {
            DbCharacter playerCharacterData = player.getPlayerCharacterData();

            if(playerCharacterData == null) return;

            onDeath(player);

            player.safeSetDimension(0);
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

            player.sleepClientAc();
            NAPI.Player.SpawnPlayer(player, closestHospital.hospital.position);

            playerCharacterData.cash_amount = 0;
            player.setPlayerCharacterData(playerCharacterData, false, true);

            player.SendChatMessage(ChatUtils.hospital + "You recieved medial treatment at " + closestHospital.hospital.name);
            player.TriggerEvent("client:moveSkyCamera", "down");
            player.TriggerEvent("injured:removeStatus");
        }

        public static void updateAndSetInjuredState(Player player, DbCharacter characterData, int time = _deathTimer_seconds)
        {
            Vehicle playerVeh = null;
            int playerVehSeat = 0;

            if(player.IsInVehicle)
            {
                playerVeh = player.Vehicle;
                playerVehSeat = player.VehicleSeat;
            }

            player.sleepClientAc();
            NAPI.Player.SpawnPlayer(player, player.Position);

            if (playerVeh != null && player.GetData<bool>(VehicleSystem._seatBeltIdentifier))
            {
                NAPI.Task.Run(() =>
                {
                    if (!playerVeh.Exists) return;
                    player.SetIntoVehicle(playerVeh, playerVehSeat);
                }, 500);
            }

            characterData.injured_timer = time;
            characterData.character_health = 100;

            player.setPlayerCharacterData(characterData, false, true);
            player.TriggerEvent("injured:startInterval", time);

            Timer injuredTimer = new Timer
            {
                AutoReset = true,
                Enabled = true,
                Interval = 10 * 1000
            };

            injuredTimer.Elapsed += (object source, ElapsedEventArgs e) =>
            {
                NAPI.Task.Run(() => saveInjuredTime(player));
            };

            injuredTimers.Add(characterData.character_id, injuredTimer);
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

        public static void removeServerInjuredTimer(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if(character == null || character != null && !injuredTimers.ContainsKey(character.character_id)) return;

            Timer timer = injuredTimers[character.character_id];

            if (timer == null) return;

            timer.Dispose();

            injuredTimers.Remove(character.character_id);
        }

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

        public static void resetTimer(Player player, DbCharacter character)
        {
            removeServerInjuredTimer(player);

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

            NAPI.Task.Run(() =>
            {
                removeCorpse(playerCorpse);
            }, _pedTimeout_seconds * 1000);
        }
        #endregion
    }
}
