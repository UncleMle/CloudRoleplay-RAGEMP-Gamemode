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
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace CloudRP.DiscordSystem
{
    class DiscordSystems : Script
    {
        public static List<Command> commands = new List<Command>();

        public static string tokenIdentifier = "discordToken";
        public static string discordPrefix = "!";
        public static ulong staffChannel = 1112793951406137415;

        [ServerEvent(Event.ResourceStart)]
        public async Task OnResourceStart()
        {
            string token = Environment.GetEnvironmentVariable(tokenIdentifier);

            if(token == null)
            {
                Console.WriteLine("Discord Token was not found.");
                return;
            }

            DiscordIntegration.SetUpBotInstance(token, "Cloud Roleplay", ActivityType.Playing, UserStatus.Online);

            NAPI.Task.Run(() =>
            {
                DiscordIntegration.RegisterChannelForListenting(staffChannel);
            }, 5000);
        }

        public static void handleDiscordCommand(string[] args, SocketUser user)
        {
            commands.Clear();

            commands.Add(new Command { action = () => say(args, user), description = "A command to say messages.", name = "say" });
            commands.Add(new Command { action = () => vinfo(args, user), description = "A command to view info about a vehicle.", name = "vinfo" });
            commands.Add(new Command { action = () => helpCommand(args, user), description = "A command to view all available commands.", name = "help" });
            commands.Add(new Command { action = () => kickPlayer(args, user), description = "A command to kick a player from the server.", name = "kickplayer" });

            foreach (Command command in commands)
            {
                if (command.name == args[0])
                {
                    command.action.Invoke();
                }
            }

        }

        public static string getSplicedArgument(string[] args)
        {
            string message = string.Join(" ", args);
            message = message[(message.Split()[0].Length + 1)..];

            return message;
        }

        public static void kickPlayer(string[] args, SocketUser user)
        {
            if (args.Length < 2)
            {
                string[] arguments = { "nameOrId", "reason" };
                missingArgs(user.Id, "kickplayer", arguments);
                return;
            }

            Player player = CommandUtils.getPlayerFromNameOrId(args[1]);

            if(player != null)
            {
                player.Kick(args[2] != null ? "By admin" : args[2]);
                successEmbed(user.Id, "Kicked player [" + player.Id + "]");
            } else
            {
                errorEmbed(user.Id, "This player wasn't found online.");
                return;
            }

        }

        public static void vinfo(string[] args, SocketUser user)
        {
            if(args.Length < 2)
            {
                string[] arguments = { "vehicleId" };
                missingArgs(user.Id, "vinfo", arguments);
                return;
            }

            int? vehicleId = CommandUtils.tryParse(args[1]);

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle vehicle = dbContext.vehicles.Find(vehicleId);

                if(vehicle != null)
                {
                    EmbedBuilder builder = new EmbedBuilder
                    {
                        Title = MentionUtils.MentionUser(user.Id) + "Vehicle Info",
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

                    DiscordIntegration.SendEmbed(staffChannel, builder);

                } else
                {
                    errorEmbed(user.Id, "The specified vehicle couldn't be found.");
                }
            }
        }

        public static void helpCommand(string[] args, SocketUser user)
        {
            EmbedBuilder builder = new EmbedBuilder
            {
                Title = MentionUtils.MentionUser(user.Id) + "Help Command",
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

            DiscordIntegration.SendEmbed(staffChannel, builder);
        }

        public static void say(string[] args, SocketUser user)
        {
            if(args.Length < 2)
            {
                string[] arguments = { "message" };
                missingArgs(user.Id, "say", arguments);
                return;
            }

            string message = ChatUtils.red + "[Discord] " + ChatUtils.White + user.Username + ChatUtils.red + " says: " + ChatUtils.White + getSplicedArgument(args);


            DiscordIntegration.SendMessage(staffChannel, MentionUtils.MentionUser(user.Id) + " sent message in game!", false);
            NAPI.Chat.SendChatMessageToAll(message);
        }

        public static async Task errorEmbed(ulong userId, string desc)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = desc,
                Title = $"{MentionUtils.MentionUser(userId)} An error occured :("
            };

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }

        public static async Task successEmbed(ulong userId, string success)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Green,
                Description = success,
                Title = $"{MentionUtils.MentionUser(userId)} Success"
            };

            DiscordIntegration.SendEmbed(userId, builder);
        }

        public static async Task missingArgs(ulong userId, string commandName, string[] missingArgs)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = "Missing arguments " + "[" + string.Join(", ", missingArgs) + "]",
                Title = $"{MentionUtils.MentionUser(userId)} Missing potential arguments in command {commandName} :("
            };

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }
    }

    class Command
    {
        public Action action;
        public string name;
        public string description;
    }
}
