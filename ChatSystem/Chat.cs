using GTANetworkAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ChatSystem
{
    internal class Chat : Script
    {
        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            Console.WriteLine("Default chat disabled.");
            NAPI.Server.SetGlobalServerChat(false);
        }

        [ServerEvent(Event.ChatMessage)]
        public void onChatMessage(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToAll("Player "+player.SocialClubName+" says: "+ message);
        }
    }
}
