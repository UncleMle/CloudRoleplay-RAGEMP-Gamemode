using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.TimersIntervals
{
    public class TimersIntervals : Script
    {
        [ServerEvent(Event.Update)]
        public void tickRateUpdate()
        {
            // called every server tick 
        }

    }
}
