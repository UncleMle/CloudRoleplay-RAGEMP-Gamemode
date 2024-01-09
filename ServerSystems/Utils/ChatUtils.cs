using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Utils
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
        public static string _c_AdminSys = "[Staff] ";
        public static string yellow = "!{yellow}";
        public static string red = "!{red}";
        public static string Success = "!{#61d480}[Success] " + White;
        public static string disconnected = "!{#f57b42}[Disconnected] " + White;
        public static string antiCheat = "!{red}[AC] " + White;
        public static string hospital = "!{green}[Hospital] " + White;
        public static string info = "!{yellow}[Info] " + White;
        public static string reports = "!{yellow}[Reports] " + White;
        public static string afk = "!{orange}[Afk] " + White;

        public static void sendWithNickName(Player player, Player target, string prefix, string suffix, bool checkDims = true)
        {
            if (!checkDims)
            {
                player.TriggerEvent("sendWithNickName", target, prefix, suffix);
                return;
            }

            if (player.Dimension == target.Dimension && checkDims)
            {
                player.TriggerEvent("sendWithNickName", target, prefix, suffix);
            }
        }

        public static void formatConsolePrint(string message, ConsoleColor colour = ConsoleColor.Red)
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.Write(getTimeString());
            Console.ForegroundColor = colour;
            Console.Write(_c_Server + message);
            Console.ForegroundColor = ConsoleColor.White;

            Console.WriteLine();
        }

        public static string getTimeString()
        {
            DateTime dateTime = DateTime.Now;
            dateTime.ToFileTimeUtc();
            string dateStr = $"[{addZero(dateTime.Hour)}:{addZero(dateTime.Minute)}:{addZero(dateTime.Second)}] ";

            return dateStr;
        }

        public static string addZero(int time)
        {
            return time < 10 ? "0" + time : time.ToString();
        }
    }
}
