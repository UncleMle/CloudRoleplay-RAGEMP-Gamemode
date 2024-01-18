using CloudRP.GeneralSystems.InventorySystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.ChatSystem;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.TimeWeather;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace CloudRP.GeneralSystems.GeneralCommands
{

    public class Commands : Script
    {
        public static IEnumerable<CommandAttribute> loadedCommands = GetCommands();
        public static int _logoutTimeout_seconds = 15;
        public static string _logoutIdentifier = "playerIsLoggingOut";
        public static string _oocColour = "!{#78acff}";
        public static string _meColour = "!{#d2bae9}";
        public static int nickNameMaxLength_M = 7;
        public static int maxFloatingDos = 10;
        public static int logoutPrintRange = 50;

        public static IEnumerable<CommandAttribute> GetCommands(Assembly assembly = null)
        {
            assembly ??= Assembly.GetExecutingAssembly();
            Type[] assemblyTypes = assembly.GetTypes();
            IEnumerable<MethodInfo> assemblyMethods = assemblyTypes.SelectMany(t => t.GetMethods());
            return assemblyMethods
                .Where(m => Attribute.IsDefined(m, typeof(CommandAttribute), false))
                .SelectMany(m => m.GetCustomAttributes<CommandAttribute>());
        }

        public Commands()
        {
            foreach (CommandAttribute i in loadedCommands)
            {
                Console.WriteLine(i.CommandHelpText + " group" + i.Group);
            }
        }

        #region Commands
        [Command("logout", "~y~Use: ~w~/logout")]
        public void logoutCommand(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData != null)
            {
                if (player.IsInVehicle)
                {
                    player.WarpOutOfVehicle();
                }

                player.SetCustomData(Chat._typingStateIdentifier, false);
                player.SetCustomSharedData(Chat._typingStateIdentifier, false);

                player.SetData(_logoutIdentifier, true);
                player.SetSharedData(_logoutIdentifier, true);

                uiHandling.sendNotification(player, "~y~Logging out...", false);

                CommandUtils.successSay(player, $"You will be logged out in {_logoutTimeout_seconds} seconds.");

                NAPI.Native.SendNativeToPlayer(player, Hash.SET_PLAYER_INVINCIBLE, true);

                NAPI.Task.Run(() =>
                {
                    if (NAPI.Player.IsPlayerConnected(player))
                    {
                        NAPI.Native.SendNativeToPlayer(player, Hash._STOP_ALL_SCREEN_EFFECTS);

                        NAPI.Pools.GetAllPlayers().ForEach(p =>
                        {
                            if (Vector3.Distance(p.Position, player.Position) < 50)
                            {
                                ChatUtils.sendWithNickName(p, player, ChatUtils.yellow + "[Logout] " + ChatUtils.White, " has logged out of the server.");
                            }
                        });

                        player.setPlayerToLoginScreen();

                        uiHandling.sendPushNotif(player, "You have logged out successfully.", 4500, true, true, true);

                        player.clearChat();
                    }
                }, _logoutTimeout_seconds * 1000);
            }
        }

        [Command("b", "~y~Use:~w~ /b [message]", Alias = "ooc", GreedyArg = true)]
        public void oocCommand(Player player, string oocChat)
        {
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            string prefix = _oocColour + "((" + "!{white} ";
            string suffix = " !{grey}says:!{white} " + oocChat + " !{white}" + _oocColour + "))";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("time", "~y~Use:~w~ /time")]
        public void viewTimeCommand(Player player)
        {
            DateTime utcDateTime = DateTime.UtcNow;

            player.SendChatMessage(ChatUtils.yellow + "-----------------------------------------------------------");
            player.SendChatMessage($" UTC Date time: {ChatUtils.yellow}{utcDateTime}");
            player.SendChatMessage($" Unix time: {ChatUtils.yellow}{CommandUtils.generateUnix()}");
            player.SendChatMessage($" Server time: {ChatUtils.yellow}{TimeSystem.getFormattedServerTime()}");
            player.SendChatMessage(ChatUtils.yellow + "-----------------------------------------------------------");
        }

        [Command("clear", "~y~Use: /clear")]
        public void clearChatCommand(Player player)
        {
            player.clearChat();
        }

        [Command("afk", "~y~Use: ~w~/afk [answer]")]
        public static void afkCommand(Player player, string afkAns)
        {
            if (player.getPlayerCharacterData() == null) return;
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

        [Command("whisper", "~y~Use:~w~ /whisper [nameOrId] [message]", Alias = "w", GreedyArg = true)]
        public void whisperCommmand(Player player, string nameOrId, string message)
        {
            DbCharacter charData = player.getPlayerCharacterData();
            if (charData == null) return;
            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (findPlayer.Equals(player))
            {
                CommandUtils.errorSay(player, "You cannot whisper to yourself.");
                return;
            }

            if (findPlayer == null || findPlayer != null && Vector3.Distance(findPlayer.Position, player.Position) >= 5)
            {
                CommandUtils.errorSay(player, "The player wasn't found. (Are you within distance?)");
                return;
            }

            uiHandling.sendNotification(player, "Whispers.", true, true, "Whispers.");

            ChatUtils.sendWithNickName(findPlayer, player, "", $" {ChatUtils.yellow}whispers:{ChatUtils.White} " + ChatUtils.White + message);
            player.SendChatMessage($"{charData.character_name} {ChatUtils.yellow}whispers:{ChatUtils.White} {message}");
        }

        [Command("vlow", "~y~Use:~w~/vlow [message]", Alias = "vehiclelow", GreedyArg = true)]
        public void vehicleLowCommand(Player player, string message)
        {
            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            List<Player> closePlayers = CommandUtils.getPlayersInRadius(player, 20f);

            uiHandling.sendNotification(player, "Talks in vehicle.", true, true, "Talks in vehicle.");

            closePlayers.ForEach(p =>
            {
                if (p.IsInVehicle && p.Vehicle.Equals(player.Vehicle))
                {
                    ChatUtils.sendWithNickName(p, player, "", $" {ChatUtils.grey}says in vehicle:{ChatUtils.White} {message}");
                }
            });
        }

        [Command("me", "~y~Use:~w~ /me [message]", GreedyArg = true)]
        public void onMeCommand(Player player, string me)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            string prefix = _meColour + "* ";
            string suffix = " " + me;

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("melow", "~y~Use:~w~ /melow [message]", GreedyArg = true)]
        public void onMeLowCommand(Player player, string me)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            string prefix = _meColour + "[Low] * ";
            string suffix = " " + me;

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius_low);
        }

        [Command("shout", "~y~Use:~w~ /shout [message]", Alias = "s", GreedyArg = true)]
        public void onShoutCommand(Player player, string message)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            string prefix = "";
            string suffix = $" {ChatUtils.CloudBlueLight}shouts:{ChatUtils.White} " + message.ToUpper();

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_shout_radius);
        }

        [Command("floatingdo", "~y~Use:~w~ /fdo [messsage]", Alias = "fdo", GreedyArg = true)]
        public void addFdoCommand(Player player, string message)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            if (FloatingDo.getAllByPlayer(characterData) >= maxFloatingDos)
            {
                CommandUtils.errorSay(player, "You already have max floating dos. Use /deletefdos.");
                return;
            }

            if (!AuthUtils.validateNick(message))
            {
                CommandUtils.errorSay(player, "Floating dos cannot have certain special characters.");
                return;
            }

            FloatingDo newFdo = FloatingDo.add(characterData.owner_id, message, player.Position);

            CommandUtils.successSay(player, "Added new floating do #" + newFdo.float_do_id);
        }

        [Command("deletefdos", "~y~Use: ~w~/deletefdos", GreedyArg = true)]
        public void deleteFdos(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if (FloatingDo.getAllByPlayer(characterData) > 0)
            {
                FloatingDo.deleteAllByCharacter(characterData.character_id);
                CommandUtils.successSay(player, "You have delete all of your floating do statements.");
            }
            else
            {
                CommandUtils.errorSay(player, "You haven't created any floating dos.");
            }

        }

        [Command("do", "~y~Use:~w~ /do [message]", GreedyArg = true)]
        public void onDoCommand(Player player, string docommand)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            string prefix = _meColour + "* " + docommand + " " + $"(( ";
            string suffix = " ))";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("dolow", "~y~Use:~w~ /dolow [message]", GreedyArg = true)]
        public void onDoLowCommand(Player player, string docommand)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            string prefix = _meColour + "[Low] * " + docommand + " " + $"(( ";
            string suffix = " ))";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius_low);
        }

        [Command("ame", "~y~Use: ~w~/ame [message]", GreedyArg = true, Description = "testaisdj aiosdjaio sdjioj")]
        public void onAmeCommand(Player player, string ameText)
        {
            if (!AuthUtils.validateNick(ameText))
            {
                CommandUtils.errorSay(player, "Ame texts cannot have certain special characters.");
                return;
            }

            if (ameText.Length > 100)
            {
                CommandUtils.errorSay(player, "Ame message cannot be longer than 100 characters.");
                return;
            }

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
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            uiHandling.pushRouterToClient(player, Browsers.StatsPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerStats, character);
            uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerData, player);
        }

        [Command("players", "~y~Use: ~w~/players")]
        public void playerCommannd(Player player)
        {
            int count = 0;
            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if (player.getPlayerCharacterData() != null)
                {
                    count++;
                }
            });

            player.SendChatMessage(ChatUtils.info + $"There are currently {ChatUtils.yellow}{count}{ChatUtils.White} players online.");
        }

        [Command("pm", "~y~Use:~w~ /pm [playerNameOrId] [message]", GreedyArg = true, Alias = "privatemessage")]
        public void onPrivateMessage(Player player, string nameOrId, string message)
        {
            DbCharacter character = player.getPlayerCharacterData();
            User userData = player.getPlayerAccountData();

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
                editedPmToPlayer = ChatUtils.red + $"[ADMIN PM] from {userData.admin_name} [{player.Id}] " + ChatUtils.grey + "(( " + ChatUtils.White + message + ChatUtils.grey + " ))";
            }

            if (editedPmToPlayer == null)
            {
                ChatUtils.sendWithNickName(findPlayer, player, pmToPlayerPrefix, pmToPlayerSuffix, false);
            }
            else
            {
                NAPI.Chat.SendChatMessageToPlayer(findPlayer, editedPmToPlayer);
            }

            NAPI.Chat.SendChatMessageToPlayer(player, pmFromPlayer);
        }

        [Command("removenick", "~y~Use: ~w~/removenick [nameOrId]")]
        public void removeNickName(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player wasn't found. (Are you within distance?)");
                return;
            }

            DbCharacter findPlayerData = findPlayer.getPlayerCharacterData();

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
                }

                dbContext.Remove(findNick);
                dbContext.SaveChanges();
                CommandUtils.successSay(player, $"Removed nickname of {findNick.nickname} for Player [{findPlayer.Id}]");
            }
        }

        [Command("dice", "~y~Use:~w~ /dice [amount]")]
        public void diceCommand(Player player, int amount = 6)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            if (amount < 0 || amount > 1000)
            {
                CommandUtils.errorSay(player, "Dice value must be greater than zero and less than 1000");
                return;
            }

            int diceRoll = new Random().Next(1, amount + 1);

            string prefix = _meColour + $"**** ";
            string suffix = $" Rolls a {amount} sided dice. It lands on {diceRoll}";

            CommandUtils.sendMessageToPlayersInRadius(player, prefix, suffix, CommandUtils._rp_commands_radius);
        }

        [Command("nick", "~y~Use: ~w~/nick [nameOrId] [nickname]", GreedyArg = true)]
        public void nicknameCommand(Player player, string playerOrId, string nickname)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(playerOrId);

            if (findPlayer == null)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            DbCharacter findCharData = findPlayer.getPlayerCharacterData();

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
        #endregion

        #region Remote Events
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
        #endregion

        #region Global Methods
        public static void setPlayersNick(Player player, Player targetEnt, string nick)
        {
            player.TriggerEvent("set:nickName", targetEnt, nick);
        }

        public static string findNickNameForPlayer(Player player, Player target)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            DbCharacter targetCharData = target.getPlayerCharacterData();

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
        #endregion
    }
}
