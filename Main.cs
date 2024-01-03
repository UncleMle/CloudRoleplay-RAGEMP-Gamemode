using CloudRP.AntiCheat;
using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.Utils;
using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace CloudRP
{
    public class Main : Script
    {
        public static string defaultErrorMessage = ChatUtils.error + " specified command could not be found. Use /help to view available commands.";

        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            NAPI.Server.SetCommandErrorMessage(defaultErrorMessage);
            ChatUtils.formatConsolePrint(" Gamemode has started", ConsoleColor.Cyan);
        }
    }
}
