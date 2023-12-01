using CloudRP.Utils;
using GTANetworkAPI;
using Integration;
using System;
using System.Collections.Generic;
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

        public static void handleDiscordCommand(string[] args, string username)
        {
            actions.Clear();

            actions.Add("say", () => say(args, username));

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

        public static void say(string[] args, string username)
        {
            if(args.Length < 2)
            {
                DiscordIntegration.SendMessage(staffChannel, "Use: " + discordPrefix + "say [message]");
                return;
            }

            string message = ChatUtils.red + "[Discord] " + ChatUtils.White + username + ChatUtils.red + " says: " + ChatUtils.White + getSplicedArgument(args);

            NAPI.Chat.SendChatMessageToAll(message);
        }

    }
}
