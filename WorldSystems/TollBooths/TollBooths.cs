using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.TollBooths
{
    public class TollBooths : Script
    {
        public static List<TollBooth> tollBooths = new List<TollBooth>
        {
            new TollBooth
            {
                boothPos = new Vector3(-1779.0, 4739.0, 57.0),
                boothRot = 135.3f,
                boothColPos = new Vector3(-1776.8, 4734.9, 57.0),
                jobStartPos = new Vector3(-1779.1, 4739.7, 59.0),
                boothBarrierPos = new Vector3(-1773.9, 4733.9, 58.3),
                boothBarrierRot = 130.4f,
                tollPrice = 20
            }
        };
    }
}
