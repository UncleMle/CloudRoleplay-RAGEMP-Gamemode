using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.CustomEvents
{
    public class KeyPressEvents : Script
    {
        public delegate void KeyPressEventsEventHandler(Player player);

        public static event KeyPressEventsEventHandler keyPress_Y;

        [RemoteEvent("server:handleKeyPress:Y")]
        public void handleKeyPress(Player player)
        {
            keyPress_Y(player);
        }
    }
}
