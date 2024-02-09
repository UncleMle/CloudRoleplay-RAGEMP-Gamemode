using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.DCCFaction
{
    public class DCCFactionUIData
    {
        public int onDutyMembers { get; set; }
        public ServiceData activeService {  get; set; }
        public Dictionary<AvailableServices, string> services { get; set; }
    }

    public class ServiceData
    {
        public long createdAt { get; set; }
        public AvailableServices service { get; set; }
    }
}
