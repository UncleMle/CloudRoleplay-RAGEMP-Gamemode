using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Utils
{
    internal class ChatUtils : Script
    {
        public static readonly string CloudBlue = "!{#ad67ee}";
        public static readonly string CloudBlueLight = "!{#d6affa}";
        public static readonly string White = "!{white}";
        public static readonly string grey = "!{grey}";
        public static readonly string orange = "!{orange}";
        public static readonly string moneyGreen = "!{#3e9c35}";
        public static readonly string CloudRP = CloudBlue + "[CloudRP] " + White;
        public static readonly string error = "!{red}[Error]!{white} ";
        public static readonly string _c_CharacterSystem = "[Characters] ";
        public static readonly string _c_AntiCheatSystem = "[AntiCheat] ";
        public static readonly string _c_DiscordSystem = "[Discord] ";
        public static readonly string _c_DeathSystem = "[Death] ";
        public static readonly string _c_Hospital = "[Hospital] ";
        public static readonly string _c_Server = "[Server] ";
        public static readonly string _c_AdminSys = "[Staff] ";
        public static readonly string yellow = "!{yellow}";
        public static readonly string red = "!{red}";
        public static readonly string Success = "!{#61d480}[Success] " + White;
        public static readonly string disconnected = "!{#f57b42}[Disconnected] " + White;
        public static readonly string antiCheat = "!{red}[AC] " + White;
        public static readonly string hospital = "!{green}[Hospital] " + White;
        public static readonly string info = "!{yellow}[Info] " + White;
        public static readonly string reports = "!{yellow}[Reports] " + White;
        public static readonly string afk = "!{orange}[Afk] " + White;
        public static readonly string freelanceJobs = CloudBlue + "[Freelance Jobs] " + White;
        public static readonly string dmv = yellow + "[Dmv] " + White;
        public static readonly string darkGreen = "!{#7bb089}";
        public static readonly string factions = CloudBlue + "[Faction System] " + White;
        public static readonly string salary = moneyGreen + "[Salary] ";
        public static readonly string vip = "!{#ebc034}[!{#ebdf34}V!{#cdeb34}I!{#abeb34}P!{#93eb34}] " + White;
        public static readonly string dcc = "!{#f0cb58}[DCC] " + White;
        public static readonly string longDo = "!{#bb53ff}";
        public static readonly string rentalVehicles = darkGreen + "[Rental Vehicles] " + White;

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

    public class ChatDistanceColour
    {
        public float distance { get; set; }
        public string colour { get; set; }
    }
}
