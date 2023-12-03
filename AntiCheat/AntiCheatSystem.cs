using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.DiscordSystem;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Integration;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.AntiCheat
{
    class AntiCheatSystem : Script
    {
        public static double _alertRadius = 45.5;

        [ServerEvent(Event.PlayerDisconnected)]
        public void OnPlayerDisconnect(Player player, DisconnectionType type, string reason)
        {
            List<Player> playersInRange = NAPI.Player.GetPlayersInRadiusOfPlayer(_alertRadius, player);

            foreach (Player p in playersInRange)
            {
                string disconnectedMessage = ChatUtils.disconnected + "Player  [" + player.Id + "]  has disconnected from the server.";

                NAPI.Chat.SendChatMessageToPlayer(p, disconnectedMessage);
            }
        }

        [ServerEvent(Event.PlayerConnected)]
        public void OnPlayerConnected(Player player)
        {
            sleepClient(player);
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
        public static async Task alertAdmins(Player player, int exception, string message)
        {
            Dictionary<Player, User> onlineStaff = AdminUtils.gatherStaff();


            User userData = PlayersData.getPlayerAccountData(player);
            if (userData == null && exception != (int)AcExceptions.tpHack)
            {
                foreach (KeyValuePair<Player, User> entry in onlineStaff)
                {
                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + "Player [" + player.Id + "] was kicked.");
                }

                ChatUtils.acSysPrint("Player [" + player.Id + "] was kicked.");
                player.Kick("[Anti Cheat]");
                return;
            }

            if (exception == (int)AcExceptions.disallowedWeapon && userData != null)
            {
                User antiCheat = AdminUtils.getAcBanAdmin();

                AdminUtils.banAPlayer(-1, antiCheat, userData, player, "Disallowed weapon");

                foreach (KeyValuePair<Player, User> entry in onlineStaff)
                {
                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + "Player [" + player.Id + $"] ({userData.username}) was banned for disallowed weapon flag.");
                }

                ChatUtils.acSysPrint("Player [" + player.Id + "] was banned.");

                return;
            }

            //  && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin
            //if (userData != null) return;

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            string suffix = (characterData != null ? "from " + characterData.character_name : $" Player") + $" [{player.Id}]" ;

            ChatUtils.acSysPrint(message + suffix);

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + message + suffix);
            }

            if (exception != (int)AcExceptions.tpHack)
            {
                await DiscordIntegration.SendMessage(DiscordSystems.staffChannel, message + suffix);
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
