using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.BanksAtms
{
    public class Bank
    {
        public string name { get; set; }
        public Vector3 blipPos { get; set; }
        public List<Vector3> tellers { get; set; }
    }
}
