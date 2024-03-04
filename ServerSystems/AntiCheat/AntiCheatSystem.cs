using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.FactionSystems;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.Versioning;
using System.Threading.Tasks;

namespace CloudRP.ServerSystems.AntiCheat
{
    class AntiCheatSystem : Script
    {
        public static readonly string _safeDimensionChangingKey = "server:player:dimensionChanging";
        public static readonly int checkForValidVehicles_seconds = 14;

        private static Dictionary<AcEvents, string> antiCheatMessages = new Dictionary<AcEvents, string>
        {
            {
                AcEvents.teleportHack, "{0} [{1} | FPS {2}] triggered a teleport hack. With distance {3} meters"
            },
            {
                AcEvents.healthKey, "{0} [{1} | FPS {2}] possible health key hack. Health difference {3}"
            },
            {
                AcEvents.disallowedWeapon, "{0} [{1}] triggered a disallowed weapon exception (hash {2}). Kicking player..."
            },
            {
                AcEvents.carFly, "{0} [{1} | FPS {2}] possible car fly hack. Position difference {3}"
            },
            {
                AcEvents.vehicleSpeedHack, "{0} [{1} | FPS {2}] possible vehicle speed hack. Speed {3} kmh"
            },
            {
                AcEvents.noReloadHack, "{0} [{1} | FPS {2}] possible no reload hack. Ammo in clip {3}"
            },
            {
                AcEvents.dimensionChangeHack, "Player [{0} | {1}] triggered dimension change hack. Old dim {2} new dim {3}. Banning player..."
            },
            {
                AcEvents.vehicleSpawnHack, "Players with Ids {0} were found in a invalid vehicle entity. Kicking players and deleting entity..."
            },
            {
                AcEvents.vehicleUnlockHack, "{0} [{1}] attempted a vehicle unlock hack on vehicle {2}"
            },
            {
                AcEvents.weaponAmmoHack, "{0} [{1} | FPS {2}] Possible weapon ammo hack {3}"
            },
            {
                AcEvents.playerSpeedHack, "{0} [{1} | FPS {2}] Possible player speed hack. Player speed is {3}"
            },
            {
                AcEvents.tpToVehicle, "{0} [{1} | FPS {2}] Possible teleport into vehicle hack. Last entered vehicle {3}"
            },
            {
                AcEvents.magicBullet, "{0} [{1} | FPS {2}] Possible magic bullet / aimhack cheat."
            },
            {
                AcEvents.firerateHack, "{0} [{1} | FPS {2}] Possible weapon firerate hack. Bullets shot within 1 second {3}"
            },
            {
                AcEvents.godModeCheat, "{0} [{1} | FPS {2}] Potential godmode cheat (player took no damage). Combined HP and armour is {3}"
            }
        };

        public AntiCheatSystem()
        {
            Main.playerConnect += (player) =>
            {
                player.sleepClientAc();
                handleVpnCheck(player);
            };

            Main.resourceStart += () => ChatUtils.startupPrint($"Loaded a total of {Enum.GetNames(typeof(AcEvents)).Length} Anti cheat events.");

            DimensionChangeEvent.onDimensionChange += (player, oldDim, newDim) =>
            {
                NAPI.Task.Run(() =>
                {
                    if (!NAPI.Player.IsPlayerConnected(player)) return;

                    if (player.GetData<bool>(_safeDimensionChangingKey) || player.isBanned()) return;

                    string message = string.Format(antiCheatMessages[AcEvents.dimensionChangeHack], player.Id, player.Ping, oldDim, newDim);

                    sendAcMessage(message);

                    if (player.getPlayerAccountData() == null)
                    {
                        player.Kick();
                        return;
                    }

                    player.banPlayer(-1, "[Anti-Cheat System]", player.getPlayerAccountData(), "Dimension changer hack.");
                }, 1500);
            };

            System.Timers.Timer checkForValidVehicles = new System.Timers.Timer
            {
                AutoReset = true,
                Enabled = true,
                Interval = checkForValidVehicles_seconds * 1000
            };

            checkForValidVehicles.Elapsed += (source, elapsed) =>
            {
                NAPI.Task.Run(() => validVehicleCheck());
            };
        }

        #region Server Events
        [ServerEvent(Event.PlayerWeaponSwitch)]
        public void OnPlayerWeaponSwitch(Player player, WeaponHash oldWeapon, WeaponHash newWeapon)
        {
            if (newWeapon == WeaponHash.Unarmed) return;

            if(!WeaponList.serverWeapons.ContainsKey(newWeapon))
            {
                DbCharacter character = player.getPlayerCharacterData();

                player.Kick();

                if (character == null) return;
                
                string message = string.Format(antiCheatMessages[AcEvents.disallowedWeapon], character.character_name, player.Ping, newWeapon);

                sendAcMessage(message);
            }
        }

        [ServerEvent(Event.IncomingConnection)]
        public void OnIncomingConnection(string ip, string serial, string rgscName, ulong rgscId, GameTypes gameType, CancelEventArgs cancel)
        {
            ChatUtils.formatConsolePrint($"Player Connecting: RGNAME {rgscName} | IP {ip} | RGID {rgscId} | GTYPE {gameType}", ConsoleColor.Green);
        }

        [ServerEvent(Event.PlayerEnterVehicle)]
        public void onPlayerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            DbVehicle vehicleData = vehicle.getData();
            User userData = player.getPlayerAccountData();
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) player.WarpOutOfVehicle();

            if (userData == null || vehicleData == null && vehicle.getFreelanceJobData() == null || vehicleData != null && vehicleData.vehicle_locked && !(userData.admin_status > (int)AdminRanks.Admin_HeadAdmin || userData.adminDuty))
            {
                string message = string.Format(antiCheatMessages[AcEvents.vehicleUnlockHack], character.character_name, player.Ping, vehicleData.numberplate);

                sendAcMessage(message);

                player.WarpOutOfVehicle();
                return;
            }
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:anticheat:alertAdmins")]
        public static void alertAdmins(Player player, int exception, int fps, string acValue)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null)
            {
                player.Kick();
                sendAcMessage($"Player [{player.Id}] was kicked for triggering AC without being logged in.");
                return;
            }

            string message = string.Format(antiCheatMessages[(AcEvents)exception], 
                character.character_name, player.Ping, fps, acValue);

            sendAcMessage(message);
        }
        #endregion

        #region Global Methods
        public static void validVehicleCheck()
        {
            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                if(veh.getData() == null)
                {
                    List<int> occIds = new List<int>();

                    veh.Occupants.ForEach(occ =>
                    {
                        if (occ.Type == EntityType.Player)
                        {
                            occIds.Add(occ.Id); 
                            (occ as Player).Kick();
                        }
                    });

                    veh.Delete();

                    string message = string.Format(antiCheatMessages[AcEvents.vehicleSpawnHack], JsonConvert.SerializeObject(occIds));

                    sendAcMessage(message);
                }
            });
        }

        public static void sendAcMessage(string message)
        {
            ChatUtils.formatConsolePrint(message);

            AdminUtils.sendMessageToAllStaff(ChatUtils.antiCheat + message, (int)AdminRanks.Admin_Moderator);
        }

        public static void handleVpnCheck(Player player)
        {
            NAPI.Task.Run( async () =>
            {
                if (player.Address == null) return;

                string str = player.Address[..7];

                if (str == "192.168" || player.Address == "127.0.0.1") return;

                try
                {
                    string uri = $"https://vpnapi.io/api/{player.Address}?key={Main._vpnApiKey}";

                    HttpClient client = new HttpClient();

                    string response = await client.GetStringAsync(uri);

                    if (response != null)
                    {
                        IPAddressInfo data = JsonConvert.DeserializeObject<IPAddressInfo>(response);

                        if (data != null && (data.security.vpn || data.security.proxy))
                        {
                            ChatUtils.formatConsolePrint($"Player [{player.Id}] was kicked for VPN or Proxy! Address: {player.Address}");
                            player.Kick();
                        }
                    }
                }
                catch
                {

                }
            });
        }

        #endregion
    }

    enum AcEvents
    {
        teleportHack,
        disallowedWeapon,
        healthKey,
        carFly,
        vehicleSpeedHack,
        noReloadHack,
        dimensionChangeHack,
        vehicleSpawnHack,
        vehicleUnlockHack,
        weaponAmmoHack,
        playerSpeedHack,
        tpToVehicle,
        magicBullet,
        firerateHack,
        godModeCheat
    }
}
