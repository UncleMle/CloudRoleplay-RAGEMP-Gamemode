using CloudRP.Admin;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Security.Cryptography;
using System.Timers;
using VisualStudioConfiguration;

namespace CloudRP.World
{
    class TimeSystem : Script
    {
        private static Timer syncTime;
        private static int timerInterval_seconds = 60;
        public static int hour = 0;
        public static int min = 0;
        public static int sec = 0;
        public static bool timeSyncOn = true;

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            syncWorldTime();
            NAPI.Task.Run(() =>
            {
                syncTime = new Timer();
                syncTime.Interval = timerInterval_seconds * 1000;
                syncTime.Elapsed += syncWorldTime;

                syncTime.AutoReset = true;
                syncTime.Enabled = true;
            });
        }

        public void syncWorldTime(object source = null, ElapsedEventArgs e = null)
        {
            NAPI.Task.Run(() =>
            {
                if (!timeSyncOn) return;

                DateTime date = DateTime.Now;
                float hourOne = date.Hour;
                float minuteOne = date.Minute;
                float secondsOne = date.Second;
                float miliSeconds = date.Millisecond;

                hour = (int)((Math.Floor(minuteOne / 2) + hourOne * 6) % 24);
                min = (int)(Math.Floor(secondsOne / 2) + minuteOne * 30) % 60;
                sec = (int)(Math.Floor(miliSeconds * 0.03) + secondsOne * 30) % 60;

                NAPI.World.SetTime(hour, min, sec);
            });
        }

        [Command("tsync", "~r~/tsync")]
        public void toggleTimeSync(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                timeSyncOn = !timeSyncOn;
                AdminUtils.staffSay(player, $"You turned time sync {(timeSyncOn ? "on" : "off")}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("settime", "~r~/settime [h] [m] [s]")]
        public void setTimeCommand(Player player, int h, int m, int s)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                AdminUtils.staffSay(player, $"You set time to {h}:{m}:{s}");
                NAPI.World.SetTime(h, m, s);
            }
            else AdminUtils.sendNoAuth(player);

        }
    }
}
