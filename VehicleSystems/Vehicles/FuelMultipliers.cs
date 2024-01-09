using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleSystems.Vehicles
{
    class FuelMultipliers : Script
    {
        public static Dictionary<int, double> fuelMultipliers = new Dictionary<int, double>();

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            fuelMultipliers.Add(1, 0.0004);
            fuelMultipliers.Add(6, 0.004);
            fuelMultipliers.Add(9, 0.008);
            fuelMultipliers.Add(4, 0.009);
            fuelMultipliers.Add(0, 0.008);
            fuelMultipliers.Add(10, 0.0012);
            fuelMultipliers.Add(3, 0.009);
            fuelMultipliers.Add(15, 0.009);
            fuelMultipliers.Add(7, 0.01);
            fuelMultipliers.Add(16, 0.003);
            fuelMultipliers.Add(18, 0.003);

            ChatUtils.formatConsolePrint("Vehicle fuel multipliers loaded.", ConsoleColor.Magenta);
        }
    }
}
