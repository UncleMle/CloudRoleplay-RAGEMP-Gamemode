using CloudRP.AntiCheat;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.Utils;
using CloudRP.Vehicles;
using Discord;
using Discord.WebSocket;
using GTANetworkAPI;
using Integration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Timers;

namespace CloudRP.DiscordSystem
{
    class DiscordSystems : Script
    {
        public static List<Command> commands = new List<Command>();

        public static Timer updatePlayerCountTimer;
        public static string tokenIdentifier = "discordToken";
        public static string staffChannelIdentifer = "staffChannel";
        public static string reportAlertChannelIdentifier = "alertChannel";
        public static string discordPrefix = "!";
        public static ulong staffChannel;
        public static ulong reportAlertChannel;
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
                await successEmbed(user.Id, "Character: " + connection.character_name + " CID: #" + connection.character_id + " PID: #" + connection.player_id);

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
                await successEmbed(user.Id, "Kicked player [" + player.Id + "]");
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

            await DiscordUtils.mentionUser(user.Id);
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

        public static async Task<ulong> addReportEmbed(Report report, int reportId)
        {
            DiscordIntegration.SendMessage(staffChannel, $"A new report was created by {report.characterData.character_name} with id {reportId}");
            EmbedBuilder builder = new EmbedBuilder
            {
                Color = Discord.Color.Red,
                Title = report.title + "  (#" + reportId+")",
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

            ulong? msgId = await DiscordIntegration.SendEmbed(staffChannel, builder);

            return (ulong)(msgId ?? null);
        }

        public static async Task successEmbed(ulong userId, string success)
        {
            EmbedBuilder builder = new EmbedBuilder
            {
                Color = Discord.Color.Green,
                Description = success,
                Title = $"Success"
            };


            await DiscordUtils.mentionUser(userId);
            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }


    }

}
