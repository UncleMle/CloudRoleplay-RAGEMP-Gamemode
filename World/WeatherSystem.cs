using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Timers;

namespace CloudRP.World
{
    class WeatherSystem : Script
    {
        private static Timer syncWeatherTimer;
        private static int timerInterval_seconds = 600;
        private static int interval_delay_seconds = 5;
        public static string weatherKeyIdentifier = "weatherApiKey";
        public static string weatherSyncTo = "london";
        public static string weatherApiKey;

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            NAPI.Task.Run(() =>
            {
                weatherApiKey = Environment.GetEnvironmentVariable(weatherKeyIdentifier);

                syncWeatherTimer = new Timer();
                syncWeatherTimer.Interval = timerInterval_seconds * 1000;
                syncWeatherTimer.Elapsed += resyncWeather;

                syncWeatherTimer.AutoReset = true;
                syncWeatherTimer.Enabled = true;

                resyncWeather();
            }, interval_delay_seconds * 1000);
        }

        public static async void resyncWeather(object source = null, ElapsedEventArgs e = null)
        {
            try
            {
                HttpClient client = new HttpClient();

                string response = await client.GetStringAsync(weatherApiKey + weatherSyncTo);

                WeatherData data = JsonConvert.DeserializeObject<WeatherData>(response);

                setWeather(data.Current.Condition.Code);
            }
            catch
            {
            }
        }

        public static void setWeather(int code)
        {
            switch (code)
            {
                case 1000:
                    NAPI.World.SetWeather(Weather.EXTRASUNNY);
                    break;
                case 1003:
                    NAPI.World.SetWeather(Weather.CLOUDS);
                    break;
                case 1006:
                    NAPI.World.SetWeather(Weather.CLOUDS);
                    break;
                case 1063:
                case 1225:
                case 1066:
                    NAPI.World.SetWeather(Weather.SNOWLIGHT);
                    break;
                case 1135:
                    NAPI.World.SetWeather(Weather.FOGGY);
                    break;
                case 1183:
                    NAPI.World.SetWeather(Weather.RAIN);
                    break;
                case 1189:
                    NAPI.World.SetWeather(Weather.RAIN);
                    break;
                case 1273:
                    NAPI.World.SetWeather(Weather.THUNDER);
                    break;
                default:
                    NAPI.World.SetWeather(Weather.CLEAR);
                    break;
            }

            ChatUtils.formatConsolePrint( ChatUtils._c_Server + "Set weather to " +  code, ConsoleColor.Cyan);
        }
    }
}
