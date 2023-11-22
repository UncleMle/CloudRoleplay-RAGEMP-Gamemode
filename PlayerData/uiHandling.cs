using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerData
{
    internal class uiHandling : Script
    {
        public static void togglePlayerChat(Player player, bool toggle)
        {
            string mutationName = "setChatStatus";

            player.TriggerEvent("client:recieveUiMutation", mutationName, "toggle", toggle);
        }

        public static void sendMutationToClient(Player player, string mutationName, string key, bool value)
        {
            player.TriggerEvent("client:recieveUiMutation", mutationName, key, value);
        }

        public static void pushRouterToClient(Player player, string route)
        {
            player.TriggerEvent("browser:pushRouter", route);
        }
    }

    public static class Browsers
    {
        public static string None { get { return "/"; } }
        public static string LoginPage { get { return "/login"; } }
    }
}
