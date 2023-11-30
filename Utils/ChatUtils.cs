﻿using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class ChatUtils
    {
        public static string CloudBlue = "!{#67b1e6}";
        public static string White = "!{white}";
        public static string grey = "!{grey}";
        public static string orange = "!{orange}";
        public static string CloudRP = CloudBlue + "[CloudRP] " + White;
        public static string error = "!{red}[ERROR]!{white} ";
        public static string _c_CharacterSystem = "[Characters] ";
        public static string _c_AntiCheatSystem = "[AntiCheat] ";
        public static string yellow = "!{yellow}";
        public static string red = "!{red}";
        public static string disconnected = "!{#f57b42}[Disconnected] " + White;
        public static string antiCheat = "!{red}[AC] " + White;

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
    }
}