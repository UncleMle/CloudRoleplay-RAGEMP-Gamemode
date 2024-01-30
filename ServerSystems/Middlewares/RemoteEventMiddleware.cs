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
            // change event name to hash on server start . client requests when nessescary

            //NAPI.ClientEvent.Register(testAuth(typeof(AdminSystem).GetMethod(nameof(AdminSystem.viewReports))), "server:viewReports", new AdminSystem());
        }

        public static string setEvent(string name)
        {
            return name;
        }

        public T testAuth<T>(T t)
        {
            Console.WriteLine("Event trigger");
            return t;
        }
    }
}
