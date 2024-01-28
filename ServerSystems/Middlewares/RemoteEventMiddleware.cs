using CloudRP.Migrations;
using CloudRP.ServerSystems.Admin;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Middlewares
{
    public class RemoteEventMiddleware : Script
    {
        public static Dictionary<int, List<string>> allowedEvents = new Dictionary<int, List<string>>();

        public RemoteEventMiddleware()
        {
            NAPI.ClientEvent.Register(typeof(AdminSystem).GetMethod(nameof(AdminSystem.viewReports)), "server:viewReports", new AdminSystem());
        }
    }
}
