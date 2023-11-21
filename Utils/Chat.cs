using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class Chat
    {
        public static string CloudBlue = "!{#67b1e6}";
        public static string White = "!{white}";
        public static string CloudRP = CloudBlue + "[CloudRP] " + White;
        public static string error = "!{red}[ERROR]!{white} ";
        public static string _c_CharacterSystem = "[Characters] ";

        public static void charSysPrint(string str)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(_c_CharacterSystem + str);
            Console.ForegroundColor = ConsoleColor.White;
        }
    }
}
