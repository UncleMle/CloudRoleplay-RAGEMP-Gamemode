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

            if (characterData == null || userData == null || message.Length == 0) return;

            if (char.IsWhiteSpace(message[0])) return;

            string prefix = "";
            string suffix = " !{grey}says:!{white} ";

            if(userData.adminDuty)
            {
                string adminRank = AdminUtils.getColouredAdminRank(userData);
                prefix += adminRank + "!{red}" + $"{userData.adminName}" + "!{white} ";
            } 

            List<Player> playersInRange = CommandUtils.getPlayersInRadius(player, _chatradius);

            string chatMessage = prefix + suffix + message;

            playersInRange.ForEach(p =>
            {
                if(userData.adminDuty)
                {
                    NAPI.Chat.SendChatMessageToPlayer(p, chatMessage);
                } else
                {
                    ChatUtils.sendWithNickName(p, player, prefix, suffix + message);
                }
            });
        }

        public static void welcomePlayerOnSpawn(Player player)
        {
            User user = PlayersData.getPlayerAccountData(player);
            if (user == null) return;

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            if (characterData == null) return;

            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.CloudRP + $"Welcome back to Cloud RP {ChatUtils.CloudBlueLight}{user.username}{ChatUtils.White}.");
            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.CloudRP + $"For server commands and general help view {ChatUtils.CloudBlueLight}/help{ChatUtils.White}.");
            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.CloudRP + $"Visit {ChatUtils.CloudBlueLight}cloudrp.net{ChatUtils.White} for server information{ChatUtils.White}.");

            if (user.adminLevel > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user, false);
                NAPI.Chat.SendChatMessageToPlayer(player, AdminUtils.staffPrefix + $"Welcome back, {colouredRank}{AdminUtils.staffSuffixColour}" + user.adminName + ".");
            }
        }
    }
}
