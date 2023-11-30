using GTANetworkAPI;
using Integration;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.DiscordSystem
{
    class DiscordSystems : Script
    {
        public static string tokenIdentifier = "discordToken";
        public static ulong staffChannel = 1073277392933621951;

        [ServerEvent(Event.ResourceStart)]
        public void OnResourceStart()
        {
            string token = Environment.GetEnvironmentVariable(tokenIdentifier);

            if(token == null)
            {
                Console.WriteLine("Discord Token was not found.");
                return;
            }

            DiscordIntegration.SetUpBotInstance(token, "RAGE:MP", Discord.ActivityType.Playing, Discord.UserStatus.Online);
        }

        public static void sendDiscordToStaff(string message)
        {
            DiscordIntegration.SendMessage(staffChannel, message);
        }

    }
}
