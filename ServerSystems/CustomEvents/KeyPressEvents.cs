using CloudRP.ServerSystems.Utils;
using CloudRP.World.TimeWeather;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.CustomEvents
{
    public class KeyPressEvents : Script
    {
        public delegate void KeyPressEventsEventHandler(Player player);

        #region Event Handlers
        public static event KeyPressEventsEventHandler keyPress_Y;
        public static event KeyPressEventsEventHandler keyPress_F4;
        public static event KeyPressEventsEventHandler keyPress_F3;
        public static event KeyPressEventsEventHandler keyPress_CTRL_D;
        #endregion

        #region Remote Events
        [RemoteEvent("server:handleKeyPress")]
        public void handleKeyPress(Player player, int key)
        {
            switch ((KeyType)key)
            {
                case KeyType.KEY_F4: {
                        keyPress_F4(player);
                        break;
                }
                case KeyType.KEY_Y: {
                        keyPress_Y(player);
                        break;
                }
                case KeyType.KEY_CTRL_D: {
                        keyPress_CTRL_D(player);
                        break;
                }
                case KeyType.KEY_F3:
                {
                        keyPress_F3(player);
                        break;
                }
            }
        }

        #endregion

        public enum KeyType
        {
            KEY_Y,
            KEY_F4,
            KEY_F3,
            KEY_CTRL_D
        }
    }
}
