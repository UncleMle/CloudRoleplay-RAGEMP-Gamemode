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
        public static string _sharedMutationStoreSetter = "playerMutationSetter";

        public static void togglePlayerChat(Player player, bool toggle)
        {
            string mutationName = "setChatStatus";

            player.TriggerEvent("client:recieveUiMutation", mutationName, "toggle", toggle);
        }

        public static void sendMutationToClient(Player player, string mutationName, string key, bool value)
        {
            player.TriggerEvent("client:recieveUiMutation", mutationName, key, value);
        }

        public static void sendObjectToClient(Player player, string mutationName, string key, object value)
        {
            player.TriggerEvent("client:recieveUiMutation", mutationName, key, value);
        }

        public static void handleObjectUiMutation(Player player, string mutationKey, object data)
        {
            player.TriggerEvent("browser:handlePlayerObjectMutation", mutationKey, data);
        }

        public static void handleObjectUiMutationPush(Player player, string mutationKey, object data)
        {
            player.TriggerEvent("browser:handlePlayerObjectMutationPush", mutationKey, data);
        }

        public static void pushRouterToClient(Player player, string route)
        {
            player.TriggerEvent("browser:pushRouter", route);
        }

        public static void resetMutationPusher(Player player, string mutationKey)
        {
            player.TriggerEvent("browser:resetMutationPusher", mutationKey);
        }
    }

    public static class Browsers
    {
        public static readonly string None = "/";
        public static readonly string LoginPage = "/login";
        public static readonly string StatsPage = "/stats";
        public static readonly string BanPage = "/ban";
    }

    public static class MutationKeys
    {
        public static readonly string PlayerStats = "player_stats";
        public static readonly string BanData = "player_bandata";
        public static readonly string PlayerData = "player_data_server";
        public static readonly string PlayerCharacters = "player_characters";
    }
}
