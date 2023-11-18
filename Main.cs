using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Linq;

namespace CloudRP
{
    public class Main : Script
    {
        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            var db = new DbConn();

            Console.Write($"{db.Database}");
            

            Console.WriteLine("Gamemode started.");
        }
    }
}
