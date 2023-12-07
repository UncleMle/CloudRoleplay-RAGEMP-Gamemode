﻿using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.ValueGeneration.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.GeneralCommands
{
    internal class Commands : Script
    {
        public static string _oocColour = "!{#78acff}";
        public static string _meColour = "!{#d2bae9}";

        [Command("b", "~y~Use: /b [message]", Alias = "ooc", GreedyArg = true)]
        public void oocCommand(Player player, string oocChat)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string oocMessageFormatted = _oocColour + "((" + "!{white} " + CommandUtils.formatCharName(character.character_name) + $" [{player.Id}] " + " !{grey}says:!{white} " + oocChat + " !{white}" + _oocColour + "))";

            CommandUtils.sendMessageToPlayersInRadius(player, oocMessageFormatted, CommandUtils._rp_commands_radius);
        }

        [Command("me", "~y~~ [message]", GreedyArg = true)]
        public void onMeCommand(Player player, string me)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string meMessageFormatted = _meColour + "* " + CommandUtils.formatCharName(character.character_name) + " " + $"[{player.Id}] " + me;


            CommandUtils.sendMessageToPlayersInRadius(player, meMessageFormatted, CommandUtils._rp_commands_radius);
        }

        [Command("do", "~y~Use: /do [message]", GreedyArg = true)]
        public void onDoCommand(Player player, string docommand)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string doFormatted = _meColour + "* " + docommand + " " + $"(( Player [{player.Id}] ))";

            CommandUtils.sendMessageToPlayersInRadius(player, doFormatted, CommandUtils._rp_commands_radius);
        }

        [Command("stats", "~y~Use: /stats")]
        public void onStatsCommand(Player player)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            uiHandling.pushRouterToClient(player, Browsers.StatsPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerStats, character);
            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerData, player);

        }

        [Command("pm", "~y~Use: /pm [playerNameOrId] [message]", GreedyArg = true, Alias = "privatemessage")]
        public void onPrivateMessage(Player player, string nameOrId, string message)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);
            User userData = PlayersData.getPlayerAccountData(player);

            if (character == null || userData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (findPlayer.Equals(player))
            {
                CommandUtils.errorSay(player, "You cannot pm yourself.");
                return;
            }

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found");
                return;
            }

            string pmToPlayer = ChatUtils.yellow + $"[PM] from {character.character_name} [{player.Id}] " + ChatUtils.grey + "(( " + ChatUtils.White + message + ChatUtils.grey + " ))";
            string pmFromPlayer = ChatUtils.grey + $"[PM] You " + "(( " + message + " ))";

            if (userData.adminDuty)
            {
                pmToPlayer = ChatUtils.red + $"[ADMIN PM] from {userData.adminName} [{player.Id}] " + ChatUtils.grey + "(( " + ChatUtils.White + message + ChatUtils.grey + " ))";
            }

            NAPI.Chat.SendChatMessageToPlayer(findPlayer, pmToPlayer);
            NAPI.Chat.SendChatMessageToPlayer(player, pmFromPlayer);
        }

        [RemoteEvent("server:requestPlayerNickname")]
        public static void requestNickName(Player player, Player target)
        {
            string nickName = findNickNameForPlayer(player, target);

            if(nickName != null)
            {
                setPlayersNick(player, target, nickName);
            }
        }

        public static void setPlayersNick(Player player, Player targetEnt, string nick)
        {
            player.TriggerEvent("set:nickName", targetEnt, nick);
        }

        [Command("nick", "~y~Use: ~w~/nick [nameOrId] [nickname]", GreedyArg = true)]
        public void nicknameCommand(Player player, string playerOrId, string nickname)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(playerOrId);
            DbCharacter findCharData = PlayersData.getPlayerCharacterData(findPlayer);

            if(findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found.");
                return;
            }

            if(nickname.Length > 120)
            {
                CommandUtils.errorSay(player, "Nickname length cannot be greater than 120.");
                return;
            }

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                Nickname nicknameExisting = dbContext.nicknames.Where(nick => nick.owner_id == characterData.character_id && nick.target_character_id == findCharData.character_id).FirstOrDefault();

                if(nicknameExisting != null)
                {
                    nicknameExisting.nickname = nickname;
                    dbContext.nicknames.Update(nicknameExisting);
                    return;
                } else
                {
                    dbContext.nicknames.Add(new Nickname
                    {
                        nickname = nickname,
                        target_character_id = findCharData.character_id,
                        owner_id = characterData.character_id,
                    });
                }


                NAPI.Chat.SendChatMessageToPlayer(player, $"{ChatUtils.Success} You {(nicknameExisting != null ? "updated" : "set")} Player [{findPlayer.Id}]'s nickname to {nickname}");
                setPlayersNick(player, findPlayer, nickname);
                dbContext.SaveChanges();
            }
        }

        public static string findNickNameForPlayer(Player player, Player target)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            DbCharacter targetCharData = PlayersData.getPlayerCharacterData(target);

            if (targetCharData != null && characterData != null)
            {
                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Nickname findNick = dbContext.nicknames.Where(nick => nick.owner_id == characterData.character_id && nick.target_character_id ==  targetCharData.character_id).FirstOrDefault();

                    return findNick.nickname;
                }
            }
            else return null;
        }
    }
}
