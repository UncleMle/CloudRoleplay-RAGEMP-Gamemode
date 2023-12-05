using CloudRP.AntiCheat;
using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.Utils;
using CloudRP.World;
using GTANetworkAPI;
using System;

namespace CloudRP
{
    public class Main : Script
    {
        public static Weather defaultWeather = Weather.XMAS;
        public static string defaultErrorMessage = ChatUtils.error + " specified command could not be found. Use /help to view available commands.";

        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            Environment.SetEnvironmentVariable(Auth._emailUserEnv, Env._gmailSmtpUser);
            Environment.SetEnvironmentVariable(Auth._emailPassEnv, Env._gmailSmtpPass);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.tokenIdentifier, Env._discordToken);
            Environment.SetEnvironmentVariable(DefaultDbContext.connectionStringKey, Env._databaseConnectionString);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.staffChannelIdentifer, Env._discordStaffChannel);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.reportAlertChannelIdentifier, Env._discordReportAlertChannel);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.guildIdIdentifier, Env._discordGuildId);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.discordReportCategoryIdentifier, Env._discordReportCategory);
            Environment.SetEnvironmentVariable(DiscordSystem.DiscordSystems.reportAlertChannelIdentifier, Env._discordReportAlertChannel);
            Environment.SetEnvironmentVariable(WeatherSystem.weatherKeyIdentifier, Env._weatherApiKey);
            Environment.SetEnvironmentVariable(AntiCheatSystem.vpnApiKeyIdentifier, Env._vpnApiKey);
            
            NAPI.Server.SetCommandErrorMessage(defaultErrorMessage);
            NAPI.World.SetWeather(defaultWeather);
            ChatUtils.formatConsolePrint(ChatUtils._c_Server + " Gamemode has started", ConsoleColor.Cyan);
        }
    }
}
