using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.GeneralSystems.HousingSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.DiscordSystem;
using CloudRP.ServerSystems.Utils;
using CloudRP.World;
using CloudRP.World.BanksAtms;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.CompilerServices;

namespace CloudRP
{
    public class Main : Script
    {
        public static string JsonDirectory = "";
        public static string _dbHost = "";
        public static string _dbUser = "";
        public static string _dbPassword = "";
        public static string _dbDatabase = "";
        public static string _gmailUser = "";
        public static string _gmailPass = "";
        public static string _discordToken = "";
        public static string _weatherApiKey = "";
        public static string _vpnApiKey = "";
        public static string _discordStaffChannel = "";
        public static string _discordReportChannel = "";
        public static string _discordGuild = "";
        public static string _discordReportCat = "";
        

        public static string defaultErrorMessage = ChatUtils.error + " specified command could not be found. Use /help to view available commands.";

        public Main()
        {
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                LogException(e);
            };
        }

        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            JsonDirectory = Directory.GetCurrentDirectory() + NAPI.Resource.GetSetting<string>(this, "jsonentrypoint");
            _dbHost = NAPI.Resource.GetSetting<string>(this, "host");
            _dbDatabase = NAPI.Resource.GetSetting<string>(this, "database");
            _dbUser = NAPI.Resource.GetSetting<string>(this, "username");
            _dbPassword = NAPI.Resource.GetSetting<string>(this, "password");

            _gmailUser = NAPI.Resource.GetSetting<string>(this, "gmailuser");
            _gmailPass = NAPI.Resource.GetSetting<string>(this, "gmailpass");

            _discordToken = NAPI.Resource.GetSetting<string>(this, "discordtoken");
            _discordStaffChannel = NAPI.Resource.GetSetting<string>(this, "discordstaffchannel");
            _discordReportChannel = NAPI.Resource.GetSetting<string>(this, "discordreportalertchannel");
            _discordGuild = NAPI.Resource.GetSetting<string>(this, "discordguildid");
            _discordReportCat = NAPI.Resource.GetSetting<string>(this, "discordreportcat");


            _weatherApiKey = NAPI.Resource.GetSetting<string>(this, "weatherapikey");
            _vpnApiKey = NAPI.Resource.GetSetting<string>(this, "vpnapikey");

            NAPI.Server.SetCommandErrorMessage(defaultErrorMessage);

            HousingSystem.loadAllHouses();
            FloatingDo.loadFdos();
            CharacterSystem.beginSaveInterval();
            AdminMarker.loadMarkers();
            Atm.loadAtms();
            DiscordSystems.initDiscordSystem();

            ChatUtils.formatConsolePrint(" Gamemode has started", ConsoleColor.Cyan);
        }

        public void LogException(UnhandledExceptionEventArgs exception)
        {
            using var stream = File.AppendText("exceptions.txt");
            stream.WriteLine("json: " + NAPI.Util.ToJson(exception));
            stream.WriteLine("exception object: " + exception.ExceptionObject);
            stream.Close();
        }
    }
}
