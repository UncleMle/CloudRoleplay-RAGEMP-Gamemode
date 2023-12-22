using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;

namespace CloudRP.AntiCheat
{
    class AntiCheatSystem : Script
    {
        public static double _alertRadius = 45.5;
        public static string vpnApiKeyIdentifier = "vpnApiKey";

        [ServerEvent(Event.PlayerConnected)]
        public async void OnPlayerConnected(Player player)
        {
            if (player.Address == null) return;

            string str = player.Address.Substring(0, 7);

            if (str == "192.168" || player.Address == "127.0.0.1") return;

            try
            {
                string uri = $"https://vpnapi.io/api/{player.Address}?key={Env._vpnApiKey}";

                HttpClient client = new HttpClient();

                string response = await client.GetStringAsync(uri);
                
                if(response != null)
                {
                    IPAddressInfo data = JsonConvert.DeserializeObject<IPAddressInfo>(response);

                    if (data.security.vpn || data.security.proxy)
                    {
                        ChatUtils.formatConsolePrint($"Player [{player.Id}] was kicked for VPN or Proxy! Address: {player.Address}");
                        player.Kick();
                    }
                }
            }
            catch
            {

            }

            sleepClient(player);
        }

        [ServerEvent(Event.IncomingConnection)]
        public void OnIncomingConnection(string ip, string serial, string rgscName, ulong rgscId, GameTypes gameType, CancelEventArgs cancel)
        {
            ChatUtils.formatConsolePrint($"Player Connecting: RGNAME {rgscName} | IP {ip} | RGID {rgscId} | GTYPE {gameType}", ConsoleColor.Green);
        }

        [ServerEvent(Event.PlayerWeaponSwitch)]
        public void OnPlayerWeaponSwitch(Player player, WeaponHash oldWeapon, WeaponHash newWeapon)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            player.TriggerEvent("client:weaponSwap");
        }


        [RemoteEvent("server:CheatDetection")]
        public static void alertAdmins(Player player, int exception, string message)
        {
            Dictionary<Player, User> onlineStaff = AdminUtils.gatherStaff();

            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null && (userData.adminDuty || userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)) return;

            if (userData == null && exception != (int)AcExceptions.tpHack)
            {
                foreach (KeyValuePair<Player, User> entry in onlineStaff)
                {
                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + "Player [" + player.Id + "] was kicked.");
                }

                ChatUtils.formatConsolePrint("Player [" + player.Id + "] was kicked.");
                player.Kick("[Anti Cheat]");
                return;
            }

            if (exception == (int)AcExceptions.disallowedWeapon && userData != null && userData.admin_status > (int)AdminRanks.Admin_Founder)
            {
                User antiCheat = AdminUtils.getAcBanAdmin();

                AdminUtils.banAPlayer(-1, antiCheat, userData, player, "Disallowed weapon");

                foreach (KeyValuePair<Player, User> entry in onlineStaff)
                {
                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + "Player [" + player.Id + $"] ({userData.username}) was banned for disallowed weapon flag.");
                }

                ChatUtils.formatConsolePrint("Player [" + player.Id + "] was banned.");

                return;
            }

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            string suffix = (characterData != null ? " from " + characterData.character_name : $" Player") + $" [{player.Id}]" ;

            ChatUtils.formatConsolePrint(message + suffix);

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + message + suffix);
            }
        }

        public static void sleepClient(Player player, int duration = 2000)
        {
            player.TriggerEvent("client:acSleep", duration);
        }

    }

    enum AcExceptions
    {
        tpHack = 0,
        disallowedWeapon = 1,
        vehicleSpeedOrFly = 2,
        noReloadHack = 3,
        ammoHack = 4,
        healthKey = 5
    }
}
