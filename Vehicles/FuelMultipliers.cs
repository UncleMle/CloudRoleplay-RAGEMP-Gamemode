using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Vehicles
{
    class FuelMultipliers : Script
    {
        public static Dictionary<int, double> fuelMultipliers = new Dictionary<int, double>();

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            fuelMultipliers.Add(1, 0.0004);
            fuelMultipliers.Add(7, 0.003);

            ChatUtils.formatConsolePrint("Vehicle fuel multipliers loaded.", ConsoleColor.Magenta);
        }
    }
}
