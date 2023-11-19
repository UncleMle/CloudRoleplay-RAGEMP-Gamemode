using CloudRP.Authentication;
using CloudRP.Database;
using GTANetworkAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using static CloudRP.Authentication.Account;

namespace CloudRP
{
    public class Main : Script
    {
        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            Console.WriteLine("Gamemode started");
        }
    }
}
