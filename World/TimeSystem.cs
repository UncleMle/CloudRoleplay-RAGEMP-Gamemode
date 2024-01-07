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
        private static int timerInterval_seconds = 20;
        public static int hour = 7;
        public static int min = 0;
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
                if (timeSyncOn)
                {
                    if (min == 59)
                    {
                        min = 0;

                        if (hour == 23)
                        {
                            hour = 0;
                        }
                        else
                        {
                            hour++;
                        }
                    }

                    min++;

                    NAPI.World.SetTime(hour, min, 0);
                }
            });
        }

        public static string getFormattedServerTime()
        {
            return $"{(hour < 10 ? "0": "")}{hour}:{(min < 10 ? "0" : "")}{min}";
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
