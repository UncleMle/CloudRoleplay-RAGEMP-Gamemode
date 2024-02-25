using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.CasinoSystems
{
    public class CasinoSystem : Script
    {
        public static readonly Vector3 casinoLocation = new Vector3(931.3, 42.4, 81.1);

        public CasinoSystem()
        {
            NAPI.Blip.CreateBlip(679, casinoLocation, 1f, 4, "Casino", 255, 1f, true, 0, 0);

            Main.resourceStart += () => ChatUtils.startupPrint("Loaded in casion system");
        }
    }
}
