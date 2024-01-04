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
using System.Xml;

namespace CloudRP.ChatSystem
{
    internal class Chat : Script
    {
        public static double _chatradius = 30.0;
        public static string _typingStateIdentifier = "playerIsTypingState";

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            NAPI.Server.SetGlobalServerChat(false);
        }

        [ServerEvent(Event.ChatMessage)]
        public void onChatMessage(Player player, string message)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            User userData = player.getPlayerAccountData();

            if (characterData == null || userData == null || message.Length == 0) return;

            if (char.IsWhiteSpace(message[0])) return;

            string prefix = "";
            string suffix = " !{grey}says:!{white} ";

            if(userData.adminDuty)
            {
                string adminRank = AdminUtils.getColouredAdminRank(userData);
                prefix += adminRank + "!{red}" + $"{userData.admin_name}" + "!{white} ";
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
            User user = player.getPlayerAccountData();
            if (user == null) return;

            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            player.SendChatMessage(ChatUtils.CloudRP + $"Welcome back to Cloud RP {ChatUtils.CloudBlueLight}{user.username}{ChatUtils.White}.");
            player.SendChatMessage(ChatUtils.CloudRP + $"For server commands and general help view {ChatUtils.CloudBlueLight}/help{ChatUtils.White}.");
            player.SendChatMessage(ChatUtils.CloudRP + $"Visit {ChatUtils.CloudBlueLight}cloudrp.net{ChatUtils.White} for server information{ChatUtils.White}.");

            if (user.admin_status > (int)AdminRanks.Admin_None)
            {
                string colouredRank = AdminUtils.getColouredAdminRank(user);
                NAPI.Chat.SendChatMessageToPlayer(player, AdminUtils.staffPrefix + $"Welcome back, {colouredRank}{AdminUtils.staffSuffixColour}" + user.admin_name + ".");

                Dictionary<Player, User> onlineStaff = AdminUtils.gatherAdminGroupAbove(AdminRanks.Admin_None);

                foreach (KeyValuePair<Player, User> item in onlineStaff)
                {
                    if(item.Key != player)
                    {
                        item.Key.SendChatMessage($"{AdminUtils.staffPrefix}{user.admin_name} [{player.Id}] has connected to the server.");
                    }
                }
            }
        }

        [RemoteEvent("server:togglePlayerTyping")]
        public static void toggleTypingState(Player player, bool state)
        {
            DbCharacter charData = player.getPlayerCharacterData();

            if(charData != null)
            {
                player.SetCustomData(_typingStateIdentifier, state);
                player.SetCustomSharedData(_typingStateIdentifier, state);
            }
        }
    }
}
