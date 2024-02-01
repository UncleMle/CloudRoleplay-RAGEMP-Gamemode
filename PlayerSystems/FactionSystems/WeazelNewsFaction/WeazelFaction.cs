using CloudRP.GeneralSystems.InventorySystem;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.WeazelNewsFaction
{
    public class WeazelFaction : Script
    {
        private static readonly Vector3 weazelNews = new Vector3(-583.5, -924.9, 36.8);

        public WeazelFaction()
        {
            NAPI.Blip.CreateBlip(459, weazelNews, 1f, 4, "Weazel News", 255, 1f, true, 0, 0);
        }
    }
}
