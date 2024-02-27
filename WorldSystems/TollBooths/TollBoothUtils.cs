using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.TollBooths
{
    public class TollBooth
    {
        public int tollPrice { get; set; }
        public Vector3 boothPos { get; set; }
        public Vector3 boothBarrierPos { get; set; }
        public Vector3 boothColPos { get; set; }
        public Vector3 jobStartPos { get; set; }
        public float boothRot { get; set; }
        public bool isBoothActivated { get; set; }
        public float boothBarrierRot { get; set; }
        public GTANetworkAPI.Object barrierObject { get; set; }
    }
}
