using CloudRP.ServerSystems.Authentication;
using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using GTANetworkAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using CloudRP.ServerSystems.Utils;
using CloudRP.GeneralSystems.SpeedCameras;
using System.Linq;

namespace CloudRP.PlayerSystems.ChatSystem
{
    public class Chat : Script
    {
        public static readonly double _chatRadius = 30.0;
        public static readonly double _adminChatRadius = 52.0;
        public static readonly string _typingStateIdentifier = "playerIsTypingState";
        public static readonly List<ChatDistanceColour> distanceColours = new List<ChatDistanceColour>
        {
            new ChatDistanceColour
            {
                distance = 0,
                colour = "white"
            },
            new ChatDistanceColour
            {
                distance = 10,
                colour = "#a6a6a6"
            },
            new ChatDistanceColour
            {
                distance = 20,
                colour = "#757474"
            },
            new ChatDistanceColour
            {
                distance = 25,
                colour = "#424242"
            }
        };

        public Chat()
        {
            NAPI.Server.SetGlobalServerChat(false);
        }

        #region Server Events
        [ServerEvent(Event.ChatMessage)]
        public void onChatMessage(Player player, string message)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            User userData = player.getPlayerAccountData();

            if (characterData == null || userData == null || message.Length == 0) return;

            if (char.IsWhiteSpace(message[0])) return;

            string prefix = "";
            string suffix = " !{grey}says:!{white} ";

            if (userData.adminDuty)
            {
                string adminRank = AdminUtils.getColouredAdminRank(userData);
                prefix += adminRank + "!{red}" + $"{userData.admin_name}" + "!{white} ";
            }

            List<Player> playersInRange = CommandUtils.getPlayersInRadius(player, userData.adminDuty ? _adminChatRadius : _chatRadius);

            playersInRange.ForEach(p =>
            {
                string chatMessage = prefix + suffix + message;

                if (userData.adminDuty)
                {
                    NAPI.Chat.SendChatMessageToPlayer(p, chatMessage);
                }
                else
                {
                    float dist = Vector3.Distance(player.Position, p.Position);

                    string chatColour = "!{"+distanceColours.OrderBy(item => Math.Abs(dist - item.distance)).First()?.colour+ "}";

                    ChatUtils.sendWithNickName(p, player, chatColour, chatColour + suffix + chatColour + message);
                }
            });
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void onPlayerDisconect(Player player, DisconnectionType type, string reason)
        {
            User user = player.getPlayerAccountData();
            DbCharacter character = player.getPlayerCharacterData();

            if(user != null && character != null && user.admin_status > (int)AdminRanks.Admin_None)
            {
                AdminUtils.sendMessageToAllStaff($"Admin {user.admin_name} has disconnected from the server.", 0, true);
            }
        }

        #endregion

        #region Global Methods
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
                    if (item.Key != player)
                    {
                        item.Key.SendChatMessage($"{AdminUtils.staffPrefix}{user.admin_name} [{player.Id}] has connected to the server.");
                    }
                }
            }
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:togglePlayerTyping")]
        public static void toggleTypingState(Player player, bool state)
        {
            DbCharacter charData = player.getPlayerCharacterData();

            if (charData != null)
            {
                player.SetCustomData(_typingStateIdentifier, state);
                player.SetCustomSharedData(_typingStateIdentifier, state);
            }
        }
        #endregion
    }
}
