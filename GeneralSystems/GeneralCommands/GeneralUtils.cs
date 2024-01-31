using GTANetworkAPI;
using System.Collections.Generic;
using System.ComponentModel;

namespace CloudRP.GeneralSystems.GeneralCommands
{
    public class AfkData
    {
        public int calcAnswer;
        public Vector3 afkStartPos;
    }

    public class LicenseData
    {
        public string character_name { get; set; }
        public string character_license_data { get; set; }
    }
}
