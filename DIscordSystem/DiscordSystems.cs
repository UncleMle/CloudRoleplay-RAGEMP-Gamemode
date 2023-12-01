using CloudRP.Utils;
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
            actions.Add("vinfo", () => say(args, user));

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

        public static async Task missingArgs(string commandName, string[] missingArgs)
        {
            var builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = "Missing arguments " + "[" + string.Join(", ", missingArgs) + "]",
                Title = $"Missing arguments in command {commandName} :("
            };

            await DiscordIntegration.SendEmbed(staffChannel, builder);
        }
    }
}
