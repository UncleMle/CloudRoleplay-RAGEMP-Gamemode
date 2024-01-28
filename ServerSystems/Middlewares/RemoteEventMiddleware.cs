using CloudRP.Migrations;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Middlewares
{
    public class RemoteEventMiddleware
    {
        public static Dictionary<int, List<string>> allowedEvents = new Dictionary<int, List<string>>();

    }

    public class RemoteEventAttribute : GTANetworkAPI.RemoteEventAttribute
    {
        public RemoteEventAttribute() : base() { }
        public RemoteEventAttribute(string eventName) : base("remote." + eventName)
        {
            GTANetworkAPI.NAPI.Util.ConsoleOutput("remote." + eventName); // i have 2 references to this constructor but none outputs to the console
        }
        public RemoteEventAttribute(string eventName, Type castTo) : base("remote." + eventName, castTo) { }
    }
}
