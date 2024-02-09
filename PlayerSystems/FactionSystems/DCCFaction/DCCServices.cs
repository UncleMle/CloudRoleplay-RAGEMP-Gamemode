using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.DCCFaction
{
    public enum AvailableServices 
    {
        TaxiCab,
        Stretch,
        Coach
    }

    public class DCCServices
    {
        public static Dictionary<AvailableServices, string> services = new Dictionary<AvailableServices, string>
        {
            {
                AvailableServices.TaxiCab, "Taxi Cab"
            },
            {
                AvailableServices.Stretch, "Strech Limo"
            },
            {
                AvailableServices.Coach, "Coach Service"
            }
        };
    }
}
