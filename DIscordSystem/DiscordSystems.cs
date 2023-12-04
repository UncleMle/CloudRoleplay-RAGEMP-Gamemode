using CloudRP.Admin;
using CloudRP.AntiCheat;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.ChatSystem;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using Discord;
using Discord.WebSocket;
using GTANetworkAPI;
using Integration;
using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Timers;
using VisualStudioConfiguration;
using static System.Collections.Specialized.BitVector32;

namespace CloudRP.DiscordSystem
{
    class DiscordSystems : Script
    {
        public static List<Command> commands = new List<Command>();

        public static Timer updatePlayerCountTimer;
        public static string tokenIdentifier = "discordToken";
        public static string staffChannelIdentifer = "staffChannel";
        public static string reportAlertChannelIdentifier = "alertChannel";
        public static string guildIdIdentifier = "discordGuildId";
        public static string discordReportCategoryIdentifier = "discordReportCategory";
        public static string discordPrefix = "!";
        public static ulong staffChannel;
        public static ulong reportAlertChannel;
        public static ulong reportCategory;
        public static ulong guildId;
        public static int _updatePlayerCount = 5000;
        public static int _maxPlayers = 200;

        [ServerEvent(Event.ResourceStart)]
        public async Task OnResourceStart()
        {
            string token = Environment.GetEnvironmentVariable(tokenIdentifier);

            try
            {
                staffChannel = ulong.Parse(Environment.GetEnvironmentVariable(staffChannelIdentifer));
                reportAlertChannel = ulong.Parse(Environment.GetEnvironmentVariable(reportAlertChannelIdentifier));
                guildId = ulong.Parse(Environment.GetEnvironmentVariable(guildIdIdentifier));
                reportCategory = ulong.Parse(Environment.GetEnvironmentVariable(discordReportCategoryIdentifier));
            }
            catch
            {
                ChatUtils.discordSysPrint("Discord staff channel was not found or is incorrectly formatted.");
            }


            if (token == null)
            {
                ChatUtils.discordSysPrint("Discord Token was not found.");
                return;
            }

            DiscordIntegration.SetUpBotInstance(token, "Starting...", ActivityType.Playing, UserStatus.Online);


            NAPI.Task.Run(() =>
            {
                ChatUtils.discordSysPrint("Started listening on staff channel.");
                DiscordIntegration.RegisterChannelForListenting(staffChannel);

                DiscordIntegration.flushOldReports();
            }, 5000);


            NAPI.Task.Run(() =>
            {
                updatePlayerCountTimer = new Timer();
                updatePlayerCountTimer.Interval = _updatePlayerCount;
                updatePlayerCountTimer.Elapsed += updatePlayerCount;

                updatePlayerCountTimer.AutoReset = true;
                updatePlayerCountTimer.Enabled = true;
            });
        }

        public static void updatePlayerCount(object source, ElapsedEventArgs e)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            string status = "with " + onlinePlayers.Count + "/" + _maxPlayers + " players.";
            DiscordIntegration.UpdateStatus(status, ActivityType.Playing, UserStatus.Online);
        }

        public static void handleDiscordCommand(string[] args, SocketUser user)
        {
            commands.Clear();

            addCommmand(() => say(args, user), "to say message to all online players", "say");
            addCommmand(() => vinfo(args, user), "to view info about a vehicle", "vinfo");
            addCommmand(() => kickPlayer(args, user), "to kick a player from the server", "kickplayer");
            addCommmand(() => helpCommand(args, user), "to view all available commands", "help");
            addCommmand(() => getPlayerFromUnix(args, user), "to get a player's charactername from a unix and id.", "getpfromunix");
            
            foreach (Command command in commands)
            {
                if (command.name == args[0])
                {
                    command.action.Invoke();
                }
            }
        }

        private static void addCommmand(Action takeFunction, string desc = "N/A", string name = "N/A")
        {
            Command command = new Command
            {
                action = takeFunction,
                description = "A command " + desc + ".",
                name = name
            };

            commands.Add(command);

        }

        public static async Task getPlayerFromUnix(string[] args, SocketUser user)
        {
            if (!DiscordUtils.checkArgs(args, "getpfromunix", 3, "nameOrId, unix")) return;

            CharacterConnection connection = DiscordUtils.getJoinLog(args[1], long.Parse(args[2]));

            if (connection != null)
            {
                await successEmbed(user.Id, "Character: " + connection.character_name + " CID: #" + connection.character_id + " PID: #" + connection.player_id, staffChannel);

            } else
            {
                await errorEmbed(user.Id, "Couldn't find a character with given details.");
            }

        }
        
        public static async Task kickPlayer(string[] args, SocketUser user)
        {
            if (!DiscordUtils.checkArgs(args, "kickplayer", 2, "nameOrId")) return; 

            Player player = CommandUtils.getPlayerFromNameOrId(args[1]);

            if(player != null)
            {
                player.Kick();
                await successEmbed(user.Id, "Kicked player [" + player.Id + "]", staffChannel);
            } else
            {
                await errorEmbed(user.Id, "This player wasn't found online.");
                return;
            }
        }


        public static async Task vinfo(string[] args, SocketUser user)
        {
            if (!DiscordUtils.checkArgs(args, "vinfo", 2, "vehicleId")) return;


            int? vehicleId = CommandUtils.tryParse(args[1]);

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle vehicle = dbContext.vehicles.Find(vehicleId);

                if(vehicle != null)
                {
                    EmbedBuilder builder = new EmbedBuilder
                    {
                        Title = "Vehicle Info",
                        Color = Discord.Color.DarkerGrey,
                        Description = "Vehicle info for vehicle #"+vehicle.vehicle_id
                    };

                    builder.AddField(x =>
                    {
                        x.Name = "Vehicle Dimension";
                        x.Value = vehicle.vehicle_dimension;
                        x.IsInline = false;
                    });
                    
                    builder.AddField(x =>
                    {
                        x.Name = "Last updated";
                        x.Value = vehicle.UpdatedDate;
                        x.IsInline = false;
                    });
                    
                    builder.AddField(x =>
                    {
                        x.Name = "Vehicle Name";
                        x.Value = vehicle.vehicle_name;
                        x.IsInline = false;
                    });

                    DbCharacter characterData = dbContext.characters.Find(vehicle.owner_id);

                    if(characterData != null)
                    {
                        builder.AddField(x =>
                        {
                            x.Name = "Owner";
                            x.Value = characterData.character_name;
                            x.IsInline = false;
                        });
                        
                        builder.AddField(x =>
                        {
                            x.Name = "Owner is banned";
                            x.Value = characterData.character_isbanned == 1 ? "Yes" : "No";
                            x.IsInline = false;
                        });
                    }

                    await DiscordUtils.mentionUser(user.Id);
                    await DiscordIntegration.SendEmbed(staffChannel, builder);

                } else
                {
                    await errorEmbed(user.Id, "The specified vehicle couldn't be found.");
                }
            }
        }


        public static async Task helpCommand(string[] args, SocketUser user)
        {
            await DiscordUtils.mentionUser(user.Id);

            EmbedBuilder builder = new EmbedBuilder
            {
                Title = "Help Command",
                Color = Discord.Color.DarkerGrey,
                Description = "All commands"
            };

            foreach(Command command in commands)
            {
                builder.AddField(field =>
                {
                    field.Name = discordPrefix+command.name;
                    field.Value = command.description;
                    field.IsInline = false;
                });
            }

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }

        public static async Task say(string[] args, SocketUser user)
        {
            if (!DiscordUtils.checkArgs(args, "say", 2, "message")) return;

            string message = ChatUtils.red + "[Discord] " + ChatUtils.White + user.Username + ChatUtils.red + " says: " + ChatUtils.White + DiscordUtils.getSplicedArgument(args);


            await DiscordIntegration.SendMessage(staffChannel, MentionUtils.MentionUser(user.Id) + " sent message in game!", false);
            NAPI.Chat.SendChatMessageToAll(message);
        }

        public static async Task errorEmbed(ulong userId, string desc)
        {
            EmbedBuilder builder = new EmbedBuilder
            {
                Color = Discord.Color.Red,
                Description = desc,
                Title = $"An error occured :("
            };

            await DiscordUtils.mentionUser(userId);
            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }

        public static async Task addAReport(Report report, int reportId)
        {
            await DiscordIntegration.createAReportChannel(report);

            EmbedBuilder builder = new EmbedBuilder
            {
                Color = Discord.Color.Red,
                Title = "Report " + reportId,
                Description = report.description
            };

            builder.AddField(playerData =>
            {
                playerData.Name = "Character Name";
                playerData.Value = report.characterData.character_name;
                playerData.IsInline = false;
            });            
            
            builder.AddField(playerData =>
            {
                playerData.Name = "Username";
                playerData.Value = report.userData.username;
                playerData.IsInline = false;
            });
            
            builder.AddField(playerData =>
            {
                playerData.Name = "Player ID";
                playerData.Value = report.playerReporting.Id;
                playerData.IsInline = false;
            });

            await DiscordIntegration.SendEmbed(staffChannel, builder, report);
        }

        public static async Task successEmbed(ulong userId, string success, ulong channelId)
        {
            EmbedBuilder builder = new EmbedBuilder
            {
                Color = Discord.Color.Green,
                Description = success,
                Title = $"Success"
            };


            await DiscordIntegration.SendMessage(channelId, Discord.MentionUtils.MentionUser(userId), false);
            await DiscordIntegration.SendEmbed(channelId, builder);
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void OnPlayerDisconnect(Player player, DisconnectionType type, string reason)
        {
            Report findRep = AdminSystem.activeReports.Where(rep => rep.playerReporting.Equals(player)).FirstOrDefault();

            if (findRep != null)
            {
                closeAReport(findRep, false);
            }
        }

        public static async Task handleReportReaction(Report report, IUserMessage message, SocketReaction reaction)
        {
            IUser discordUser = reaction.User.Value;
            Player reportingPlayer = NAPI.Player.GetPlayerFromHandle(report.playerReporting.Handle);
            int rid = AdminSystem.activeReports.IndexOf(report);

            if (discordUser.IsBot || !AdminSystem.activeReports.Contains(report)) return;

            if(reaction.Emote.GetHashCode() == DiscordIntegration.closeReaction.GetHashCode())
            {
                if(reportingPlayer != null)
                {
                    NAPI.Chat.SendChatMessageToPlayer(reportingPlayer, ChatUtils.reports + "Your report was closed.");
                }

                await DiscordIntegration.SendMessageToUser(discordUser.Id, "You closed report **#" + rid +"**");
                await DiscordIntegration.SendMessage(report.discordChannelId, $"Report was closed by {discordUser.Username} closing report...");
                await closeAReport(report);
            }

            if(reaction.Emote.GetHashCode() == DiscordIntegration.joinReaction.GetHashCode())
            {
                if (report.discordAdminsHandling.Count == 0)
                {
                    NAPI.Chat.SendChatMessageToPlayer(reportingPlayer, ChatUtils.reports + $"Your report has been accepted by {discordUser.Username}.");
                    report.discordAdminsHandling.Add(discordUser.Id);
                    return;
                }

                if (!report.discordAdminsHandling.Contains(discordUser.Id))
                {
                    NAPI.Chat.SendChatMessageToPlayer(reportingPlayer, ChatUtils.reports + $"Admin {discordUser.Username} was added to the report.");
                    report.discordAdminsHandling.Add(discordUser.Id);
                }
            }
        }

        public static async Task closeAReport(Report report, bool shouldAlertAdmins = false)
        {
            await DiscordIntegration.removeAMessage(report.discordRefId);
            AdminSystem.activeReports.Remove(report);
            await DiscordIntegration.removeAChannel(report.discordChannelId);
        }

        public static async Task handleReportChannelMessage(Report report, SocketMessage message)
        {
            Player reportingPlayer = report.playerReporting;

            SocketUser admin = message.Author;

            if (reportingPlayer == null)
            {
                await DiscordIntegration.SendMessage(report.discordChannelId, "The player is not in the server closing report...");
                await closeAReport(report);
                return;
            }

            if(!report.discordAdminsHandling.Contains(admin.Id))
            {
                string msgUri = DiscordUtils.getRedirectUri(report.discordRefId);
                await DiscordIntegration.SendMessage(report.discordChannelId, "You must react to the report message to gain access to this report. (" + msgUri + ")");
                return;
            }

            string toPlayer = ChatUtils.reports + admin.Username + ChatUtils.red +" says: " + ChatUtils.White + message.Content;

            await successEmbed(admin.Id, "Player recieved message.", report.discordChannelId);
            NAPI.Chat.SendChatMessageToPlayer(reportingPlayer, toPlayer);
        }

    }

}
