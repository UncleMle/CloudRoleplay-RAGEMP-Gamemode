using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Timers;

namespace CloudRP.World.TimeWeather
{
    class WeatherSystem : Script
    {
        private static Timer syncWeatherTimer;
        private static int timerInterval_seconds = 900;
        private static int interval_delay_seconds = 5;
        public static string weatherSyncTo = "london";
        public static string weatherApiKey;
        public static bool weatherSyncOn = true;

        public WeatherSystem()
        {
            NAPI.Task.Run(() =>
            {
                weatherApiKey = Main._weatherApiKey;

                syncWeatherTimer = new Timer();
                syncWeatherTimer.Interval = timerInterval_seconds * 1000;
                syncWeatherTimer.Elapsed += resyncWeather;

                syncWeatherTimer.AutoReset = true;
                syncWeatherTimer.Enabled = true;

                resyncWeather();
            }, interval_delay_seconds * 1000);
        }

        public static void resyncWeather(object source = null, ElapsedEventArgs e = null)
        {
            NAPI.Task.Run(async () =>
            {
                if(weatherSyncOn)
                {
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
            });
        }

        public static void setWeather(int code)
        {
            NAPI.Task.Run(() =>
            {
                string weatherType = "EXTRASUNNY";

                switch (code)
                {
                    case 1000:
                        weatherType = "EXTRASUNNY";
                        break;
                    case 1003:
                    case 1006:
                        weatherType = "CLOUDS";
                        break;
                    case 1063:
                    case 1225:
                    case 1066:
                        weatherType = "SNOWLIGHT";
                        break;
                    case 1135:
                        weatherType = "FOGGY";
                        break;
                    case 1183:
                    case 1189:
                        weatherType = "RAIN";
                        break;
                    case 1273:
                        weatherType = "THUNDER";
                        break;
                    default:
                        weatherType = "CLEAR";
                        break;
                }

                NAPI.ClientEvent.TriggerClientEventForAll("client:weatherSet", weatherType);

                ChatUtils.formatConsolePrint("Set weather to " + code, ConsoleColor.Cyan);
            });
        }

        [ServerEvent(Event.PlayerConnected)]
        public void onPlayerConnected(Player player)
        {
            resyncWeather();
        }

        [Command("wsync", "~r~/wsync")]
        public void toggleWeatherSync(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                weatherSyncOn = !weatherSyncOn;
                AdminUtils.staffSay(player, $"You turned weather sync {(weatherSyncOn ? "on" : "off")}.");
            }
            else AdminUtils.sendNoAuth(player);

        }

        [Command("setw", "~r~/setw [weather]")]
        public void setweather(Player player, Weather weather)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                NAPI.ClientEvent.TriggerClientEventForAll("client:weatherSet", weather.ToString());

                AdminUtils.staffSay(player, "Set weather to " + weather);

            }
            else AdminUtils.sendNoAuth(player);
        }
    }
}
