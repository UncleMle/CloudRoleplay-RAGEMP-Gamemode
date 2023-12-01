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

namespace CloudRP.DiscordSystem
{
    class DiscordSystems : Script
    {
        public static Dictionary<string, Action> actions = new Dictionary<string, Action>();

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

            DiscordIntegration.SetUpBotInstance(token, "Cloud Roleplay", Discord.ActivityType.Playing, Discord.UserStatus.Online);

            NAPI.Task.Run(() =>
            {
                DiscordIntegration.RegisterChannelForListenting(staffChannel);
            }, 5000);
        }

        public static void handleDiscordCommand(string[] args, SocketUser user)
        {
            actions.Clear();

            actions.Add("say", () => say(args, user));
            actions.Add("vinfo", () => vinfo(args, user));

            foreach (KeyValuePair<string, Action> action in actions)
            {
                if(action.Key == args[0])
                {
                    action.Value.Invoke();
                }
            }

        }

        public static string getSplicedArgument(string[] args)
        {
            string message = string.Join(" ", args);
            message = message[(message.Split()[0].Length + 1)..];

            return message;
        }

        public static void vinfo(string[] args, SocketUser user)
        {
            if(args.Length < 2)
            {
                string[] arguments = { "vehicleId" };
                missingArgs("vinfo", arguments);
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

                    DiscordIntegration.SendEmbed(staffChannel, builder);

                } else
                {
                    errorEmbed("The specified vehicle couldn't be found.");
                }
            }

        }

        public static void say(string[] args, SocketUser user)
        {
            if(args.Length < 2)
            {
                string[] arguments = { "message" };
                missingArgs("say", arguments);
                return;
            }

            string message = ChatUtils.red + "[Discord] " + ChatUtils.White + user.Username + ChatUtils.red + " says: " + ChatUtils.White + getSplicedArgument(args);


            DiscordIntegration.SendMessage(staffChannel, MentionUtils.MentionUser(user.Id) + " sent message in game!", false);
            NAPI.Chat.SendChatMessageToAll(message);
        }

        public static async Task errorEmbed(string desc)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = desc,
                Title = $"An error occured :("
            };

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }

        public static async Task missingArgs(string commandName, string[] missingArgs)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = "Missing arguments " + "[" + string.Join(", ", missingArgs) + "]",
                Title = $"Missing arguments in command {commandName} :("
            };

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }
    }
}
