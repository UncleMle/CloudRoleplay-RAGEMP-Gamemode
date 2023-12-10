﻿using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class ChatUtils : Script
    {
        public static string CloudBlue = "!{#ad67ee}";
        public static string CloudBlueLight = "!{#d6affa}";
        public static string White = "!{white}";
        public static string grey = "!{grey}";
        public static string orange = "!{orange}";
        public static string moneyGreen = "!{#3e9c35}";
        public static string CloudRP = CloudBlue + "[CloudRP] " + White;
        public static string error = "!{red}[Error]!{white} ";
        public static string _c_CharacterSystem = "[Characters] ";
        public static string _c_AntiCheatSystem = "[AntiCheat] ";
        public static string _c_DiscordSystem = "[Discord] ";
        public static string _c_DeathSystem = "[Death] ";
        public static string _c_Hospital = "[Hospital] ";
        public static string _c_Server = "[Server] ";
        public static string yellow = "!{yellow}";
        public static string red = "!{red}";
        public static string Success = "!{#61d480}[Success] " + White;
        public static string disconnected = "!{#f57b42}[Disconnected] " + White;
        public static string antiCheat = "!{red}[AC] " + White;
        public static string hospital = "!{green}[Hospital] " + White;
        public static string info = "!{yellow}[Info] " + White;
        public static string reports = "!{yellow}[Reports] " + White;
        public static string afk = "!{orange}[Afk] " + White;

        public static void sendWithNickName(Player player, Player target, string prefix, string suffix)
        {
            player.TriggerEvent("sendWithNickName", target, prefix, suffix);
        }

        public static void charSysPrint(string str)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(_c_CharacterSystem + str);
            Console.ForegroundColor = ConsoleColor.White;
        }

        public static void acSysPrint(string str)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(_c_AntiCheatSystem + str);
            Console.ForegroundColor = ConsoleColor.White;
        }

        public static void discordSysPrint(string str)
        {
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine(_c_DiscordSystem + str);
            Console.ForegroundColor = ConsoleColor.White;
        }  
        
        public static void formatConsolePrint(string message, ConsoleColor colour)
        {
            Console.ForegroundColor = colour;
            Console.WriteLine(message);
            Console.ForegroundColor = ConsoleColor.White;
        }

        public static void deathSystem(string str)
        {
            Console.ForegroundColor = ConsoleColor.DarkRed;
            Console.WriteLine(_c_DiscordSystem + str);
            Console.ForegroundColor = ConsoleColor.White;
        }
    }
}
