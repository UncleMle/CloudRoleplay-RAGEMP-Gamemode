using GTANetworkAPI;
using GTANetworkMethods;
using System;
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

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
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
            DateTime date = DateTime.Now;
            float hourOne = date.Hour;
            float minuteOne = date.Minute;
            float secondsOne = date.Second;
            float miliSeconds = date.Millisecond;

            hour = (int)((Math.Floor(minuteOne / 2) + hourOne * 6) % 24);
            min = (int)(Math.Floor(secondsOne / 2) + minuteOne * 30) % 60;
            sec = (int)(Math.Floor(miliSeconds * 0.03) + secondsOne * 30) % 60;

            NAPI.World.SetTime(hour, min, sec);
        }

    }
}
