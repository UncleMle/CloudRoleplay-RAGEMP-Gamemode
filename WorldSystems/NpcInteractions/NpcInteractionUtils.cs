using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.NpcInteractions
{
    public class InteractionPed
    {
        public string pedHeadName { get; set; }
        public Ped ped { get; set; }
        public string[] raycastMenuItems { get; set; }
        public Action<Player, string> targetMethod { get; set; }
    }
}
