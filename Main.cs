using GTANetworkAPI;
using System;

namespace CloudRP
{
    public class Main : Script
    {
        [ServerEvent(Event.ResourceStart)]
        public void Start()
        {
            Console.WriteLine("Gamemode started.");
        }
    }
}
