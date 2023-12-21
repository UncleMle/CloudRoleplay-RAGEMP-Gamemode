using CloudRP.Admin;
using CloudRP.ChatSystem;
using CloudRP.PlayerData;
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
        private static int timerInterval_seconds = 900;
        private static int interval_delay_seconds = 5;
        public static string weatherKeyIdentifier = "weatherApiKey";
        public static string weatherSyncTo = "london";
        public static string weatherApiKey;
        public static bool weatherSyncOn = true;

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
            if (!weatherSyncOn) return;
            try
            {
                string uri = "https://api.weatherapi.com/v1/current.json?key=";

                HttpClient client = new HttpClient();

                string response = await client.GetStringAsync(uri + weatherApiKey + "&q=" + weatherSyncTo);

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

            ChatUtils.formatConsolePrint("Set weather to " +  code, ConsoleColor.Cyan);
        }

        [Command("wsync", "~r~/wsync")]
        public void toggleWeatherSync(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                weatherSyncOn = !weatherSyncOn;
                AdminUtils.staffSay(player, $"You turned weather sync {(weatherSyncOn ? "on" : "off")}.");
            } else AdminUtils.sendNoAuth(player);

        }

        [Command("setw", "~r~/setw [weather]")]
        public void setweather(Player player, Weather weather)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                NAPI.World.SetWeather(weather);

                AdminUtils.staffSay(player, "Set weather to " + weather);

            }
            else AdminUtils.sendNoAuth(player);
        }
    }
}
