﻿using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

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

        [ServerEvent(Event.PlayerWeaponSwitch)]
        public void OnPlayerWeaponSwitch(Player player, WeaponHash oldWeapon, WeaponHash newWeapon)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            player.TriggerEvent("client:weaponSwap");
        }


        [RemoteEvent("server:CheatDetection")]
        public void alertAdmins(Player player, int exception, string message)
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


            if (userData != null && userData.adminDuty) return;

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            ChatUtils.acSysPrint(message + " from " + characterData.character_name);

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                NAPI.Chat.SendChatMessageToPlayer(entry.Key, ChatUtils.antiCheat + message + " from " + characterData.character_name);
            }


        }

    }

    enum AcExceptions
    {
        tpHack = 0,
        disallowedWeapon = 1,
        vehicleSpeedOrFly = 2,
        noReloadHack = 3,
        ammoHack = 4
    }
}