using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.GeneralCommands;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ChatSystem
{
    internal class Chat : Script
    {
        public static double _chatradius = 30.0;

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            Console.WriteLine("Default chat disabled.");
            NAPI.Server.SetGlobalServerChat(false);
        }

        [ServerEvent(Event.ChatMessage)]
        public void onChatMessage(Player player, string message)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            User userData = PlayersData.getPlayerAccountData(player);

            if (characterData == null || userData == null) return;

            string prefix = "";
            string suffix = " !{grey}says:!{white} ";

            if(userData.adminDuty)
            {
                string adminRank = AdminUtils.getColouredAdminRank(userData);
                prefix += adminRank + "!{red}" + $"{userData.adminName}" + "!{white} ";
            } else
            {
                prefix += $"{characterData.character_name.Replace("_", " ")}";
            }

            List<Player> playersInRange = CommandUtils.getPlayersInRadius(player, _chatradius);

            string chatMessage = prefix + suffix + message;

            playersInRange.ForEach(p =>
            {
                NAPI.Chat.SendChatMessageToPlayer(p, chatMessage);
            });
        }

        [RemoteEvent("server:welcomePlayerOnSpawn")]
        public void welcomePlayerOnSpawn(Player player)
        {
            User user = PlayersData.getPlayerAccountData(player);
            if (user == null) return;

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            if (characterData == null) return;

            if (user.adminLevel > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);
                NAPI.Chat.SendChatMessageToPlayer(player, AdminUtils.staffPrefix + $"Welcome {colouredRank}" + user.adminName);
            }

            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.CloudRP + $"Welcome back to Cloud RP {user.username}");

            if (characterData.player_dimension != 0)
            {
                AdminUtils.staffSay(player, $"You have been spawned into dimension {characterData.player_dimension}.");
            }

        }
    }
}
