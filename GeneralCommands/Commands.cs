using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Linq;

namespace CloudRP.GeneralCommands
{
    internal class Commands : Script
    {
        public static string _oocColour = "!{#78acff}";
        public static string _meColour = "!{#d2bae9}";
        public static int nickNameMaxLength_M = 7;

        [Command("b", "~y~Use:~w~ /b [message]", Alias = "ooc", GreedyArg = true)]
        public void oocCommand(Player player, string oocChat)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);
            if (character == null) return;

            string prefix = _oocColour + "((" + "!{white} ";
            string suffix = " !{grey}says:!{white} " + oocChat + " !{white}" + _oocColour + "))";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("afk", "~y~Use: ~w~/afk [answer]")]
        public static void afkCommand(Player player, string afkAns)
        {
            if (PlayersData.getPlayerCharacterData(player) == null) return;
            AfkData afkData = player.GetData<AfkData>(Events._afkKeyIdentifier);
            if (afkData == null)
            {
                CommandUtils.errorSay(player, "You are not considered to be afk.");
                return;
            }

            if (afkData.calcAnswer == CommandUtils.tryParse(afkAns))
            {
                player.ResetData(Events._afkKeyIdentifier);
                CommandUtils.successSay(player, "Reset AFK timer.");
                return;
            }

            CommandUtils.errorSay(player, "Invalid answer.");
        }

        [Command("me", "~y~Use:~w~ /me [message]", GreedyArg = true)]
        public void onMeCommand(Player player, string me)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string prefix = _meColour + "* ";
            string suffix = " " + me;

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("shout", "~y~Use:~w~ /shout [message]", Alias = "s", GreedyArg = true)]
        public void onShoutCommand(Player player, string message)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string prefix = "";
            string suffix = $" {ChatUtils.CloudBlueLight}shouts:{ChatUtils.White} " + message.ToUpper();

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_shout_radius);
        }

        [Command("do", "~y~Use:~w~ /do [message]", GreedyArg = true)]
        public void onDoCommand(Player player, string docommand)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            string prefix = _meColour + "* " + docommand + " " + $"(( ";
            string suffix = " ))";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("ame", "~y~Use: ~w~/ame [message]")]
        public void onAmeCommand(Player player, string ameText)
        {
            uiHandling.sendNotification(player, ameText, true, true, ameText);
        }

        [Command("help", "~y~Use: ~w~/help")]
        public void onHelpCommand(Player player)
        {
            uiHandling.pushRouterToClient(player, Browsers.Help);
        }

        [Command("stats", "~y~Use:~w~ /stats")]
        public void onStatsCommand(Player player)
        {
            DbCharacter character = PlayersData.getPlayerCharacterData(player);

            if (character == null) return;

            uiHandling.pushRouterToClient(player, Browsers.StatsPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerStats, character);
            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerData, player);
        }

        [Command("pm", "~y~Use:~w~ /pm [playerNameOrId] [message]", GreedyArg = true, Alias = "privatemessage")]
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

            if (findPlayer.Equals(player))
            {
                CommandUtils.errorSay(player, "You cannot pm yourself.");
                return;
            }

            string pmToPlayerPrefix = ChatUtils.yellow + $"[PM] from ";
            string pmToPlayerSuffix = ChatUtils.grey + " (( " + ChatUtils.White + message + ChatUtils.grey + " ))";
            string editedPmToPlayer = null;

            string pmFromPlayer = ChatUtils.grey + $"[PM] You " + "(( " + message + " ))";

            if (userData.adminDuty)
            {
                editedPmToPlayer = ChatUtils.red + $"[ADMIN PM] from {userData.adminName} [{player.Id}] " + ChatUtils.grey + "(( " + ChatUtils.White + message + ChatUtils.grey + " ))";
            }

            if (editedPmToPlayer == null)
            {
                ChatUtils.sendWithNickName(findPlayer, player, pmToPlayerPrefix, pmToPlayerSuffix, false);
            } else
            {
                NAPI.Chat.SendChatMessageToPlayer(findPlayer, editedPmToPlayer);
            }

            NAPI.Chat.SendChatMessageToPlayer(player, pmFromPlayer);
        }

        [RemoteEvent("server:requestPlayerNickname")]
        public static void requestNickName(Player player, Player target)
        {
            if (target == null) return;

            string nickname = findNickNameForPlayer(player, target);

            if (nickname != null)
            {
                setPlayersNick(player, target, nickname);
            }

        }

        public static void setPlayersNick(Player player, Player targetEnt, string nick)
        {
            player.TriggerEvent("set:nickName", targetEnt, nick);
        }

        [Command("removenick", "~y~Use: ~w~/removenick [nameOrId]")]
        public void removeNickName(Player player, string nameOrId)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player wasn't found. (Are you within distance?)");
                return;
            }

            DbCharacter findPlayerData = PlayersData.getPlayerCharacterData(findPlayer);

            if (Vector3.Distance(player.Position, findPlayer.Position) > 5 || findPlayerData == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            setPlayersNick(player, findPlayer, null);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Nickname findNick = dbContext.nicknames
                    .Where(nick => nick.owner_id == characterData.character_id && nick.target_character_id == findPlayerData.character_id)
                    .FirstOrDefault();

                if (findNick == null)
                {
                    CommandUtils.errorSay(player, "You do not have a nickname set for this player!");
                    return;
                } else
                {
                    dbContext.Remove(findNick);
                    dbContext.SaveChanges();
                    CommandUtils.successSay(player, $"Removed nickname of {findNick.nickname} for Player [{findPlayer.Id}]");
                }
            }
        }

        [Command("disableautologin", "~y~Use:~w~ /disableautologin")]
        public void disableAutoLogin(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData != null)
            {
                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAcc = dbContext.accounts.Find(userData.accountId);

                    if(findAcc != null && findAcc.auto_login == 1)
                    {
                        findAcc.auto_login = 0;
                        dbContext.Update(findAcc);
                        dbContext.SaveChanges();
                        CommandUtils.successSay(player, "You disabled auto login!");
                    } else
                    {
                        CommandUtils.errorSay(player, "You don't have auto login enabled.");
                    } 
                }
            }
        }

        [Command("nick", "~y~Use: ~w~/nick [nameOrId] [nickname]", GreedyArg = true)]
        public void nicknameCommand(Player player, string playerOrId, string nickname)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(playerOrId);

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            DbCharacter findCharData = PlayersData.getPlayerCharacterData(findPlayer);

            if (Vector3.Distance(player.Position, findPlayer.Position) > 5)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            if (!AuthUtils.validateNick(nickname))
            {
                CommandUtils.errorSay(player, "You cannot use certain special characters within player nicknames.");
                return;
            }

            if (nickname.Length > 120)
            {
                CommandUtils.errorSay(player, "Nickname length cannot be greater than 120.");
                return;
            }

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Nickname nicknameExisting = dbContext.nicknames
                    .Where(nick => nick.owner_id == characterData.character_id && nick.target_character_id == findCharData.character_id)
                    .FirstOrDefault();

                if (nicknameExisting != null)
                {
                    nicknameExisting.nickname = nickname;
                    nicknameExisting.UpdatedDate = DateTime.Now;
                    dbContext.nicknames.Update(nicknameExisting);
                }
                else
                {
                    dbContext.nicknames.Add(new Nickname
                    {
                        nickname = nickname,
                        target_character_id = findCharData.character_id,
                        owner_id = characterData.character_id,
                        CreatedDate = DateTime.Now,
                    });
                }

                player.SendChatMessage($"{ChatUtils.Success} You {(nicknameExisting != null ? "updated" : "set")} Player [{findPlayer.Id}]'s nickname to {nickname}");
                setPlayersNick(player, findPlayer, nickname);
                dbContext.SaveChanges();
            }
        }

        [Command("dc", "~y~Use:~w~ /dc")]
        public static void disconnectCommand(Player player)
        {
            player.KickSilent();
        }


        public static string findNickNameForPlayer(Player player, Player target)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            DbCharacter targetCharData = PlayersData.getPlayerCharacterData(target);

            if (targetCharData != null && characterData != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Nickname findNick = dbContext.nicknames
                        .Where(nick => nick.owner_id == characterData.character_id && nick.target_character_id == targetCharData.character_id)
                        .FirstOrDefault();

                    if (findNick != null)
                    {
                        return findNick.nickname;
                    }
                }
            }
            return null;
        }
    }
    }
