using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Utils;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.CasinoSystems
{
    public class CasinoSystem : Script
    {
        public static readonly Vector3 casinoLocation = new Vector3(931.3, 42.4, 81.1);
        public static readonly Vector3 casionExternalEnter = new Vector3(936.0, 47.1, 81.1);
        public static readonly Vector3 casinoIpl = new Vector3(1089.7, 206.2, -49.0);

        public CasinoSystem()
        {
            NAPI.Blip.CreateBlip(679, casinoLocation, 1f, 4, "Casino", 255, 1f, true, 0, 0);

            Main.resourceStart += () => ChatUtils.startupPrint("Loaded in casion system");

            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                menuTitle = "Casino - Entrance",
                raycastMenuItems = new List<string> { "Enter Casino" },
                raycastMenuPosition = casionExternalEnter,
                targetMethod = (player, ray) =>
                {
                    player.sleepClientAc();
                    player.Position = casinoIpl;
                }
            });
            
            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                menuTitle = "Casino - Exit",
                raycastMenuItems = new List<string> { "Exit Casino" },
                raycastMenuPosition = casinoIpl,
                targetMethod = (player, ray) =>
                {
                    player.sleepClientAc();
                    player.Position = casionExternalEnter;
                }
            });
        }
    }
}
