using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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

        [Command("me", "~y~Use: /me [message]", GreedyArg = true)]
        public void onMeCommand(Player player, string me)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string meMessageFormatted = _meColour +"* " + CommandUtils.formatCharName(character.character_name) + " " + $"[{player.Id}] " + me;


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

        [Command("pm", "~y~Use: /pm [playerNameOrId] [message]", GreedyArg = true, Alias = "privatemessage" )]
        public void onPrivateMessage(Player player, string nameOrId, string message)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);
            User userData = PlayersData.getPlayerAccountData(player);

            if (character == null || userData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found");
                return;
            }

            string pmToPlayer = Chat.yellow+$"[PM] from {character.character_name} [{player.Id}] " + Chat.grey + "(( " + Chat.White + message + Chat.grey + " ))";
            string pmFromPlayer = Chat.grey + $"[PM] You " + "(( " + message + " ))";

            if(userData.adminDuty)
            {
                pmToPlayer = Chat.red+$"[ADMIN PM] from {userData.adminName} [{player.Id}] " + Chat.grey + "(( " + Chat.White + message + Chat.grey + " ))";
            }

            NAPI.Chat.SendChatMessageToPlayer(findPlayer, pmToPlayer);
            NAPI.Chat.SendChatMessageToPlayer(player, pmFromPlayer);

        }
    }
}
