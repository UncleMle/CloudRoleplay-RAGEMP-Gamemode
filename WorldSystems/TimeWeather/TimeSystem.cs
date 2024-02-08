using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Security.Cryptography;
using System.Timers;
using VisualStudioConfiguration;

namespace CloudRP.World.TimeWeather
{
    class TimeSystem : Script
    {
        public delegate void TimeSystemEventsHandler();

        #region Event Handlers
        public static event TimeSystemEventsHandler serverHourPassed;
        public static event TimeSystemEventsHandler realHourPassed;
        #endregion

        private static Timer syncTime;
        private static int timerInterval_seconds = 20;
        public static int hour = 7;
        public static int min = 0;
        public static bool timeSyncOn = true;

        public TimeSystem()
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

            Main.tick += handleEveryHour;
        }

        #region Global Methods
        public void syncWorldTime(object source = null, ElapsedEventArgs e = null)
        {
            NAPI.Task.Run(() =>
            {
                if (timeSyncOn)
                {
                    if (min == 59)
                    {
                        serverHourPassed();

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
            return $"{(hour < 10 ? "0" : "")}{hour}:{(min < 10 ? "0" : "")}{min}";
        }

        public static void handleEveryHour()
        {
            DateTime now = DateTime.Now;

            if(now.Minute == 0 && now.Second == 0 && now.Millisecond == 0)
            {
                realHourPassed();
            }
        }

        public static int getMinuteDifferenceToHour()
            => 60 - DateTime.Now.Minute;

        #endregion

        #region Commands
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
                hour = h;
                min = m;

                AdminUtils.staffSay(player, $"You set time to {h}:{m}:{s}");
                NAPI.World.SetTime(h, m, s);
            }
            else AdminUtils.sendNoAuth(player);
        }
        #endregion
    }
}
