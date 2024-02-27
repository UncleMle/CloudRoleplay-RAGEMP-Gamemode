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
        public static event KeyPressEventsEventHandler keyPress_E;
        public static event KeyPressEventsEventHandler keyPress_CTRL_X;
        public static event KeyPressEventsEventHandler keyPress_M;
        #endregion

        #region Remote Events
        [RemoteEvent("server:handleKeyPress")]
        public void handleKeyPress(Player player, int key, bool valid)
        {
            switch ((KeyType)key)
            {
                case KeyType.KEY_F4: {
                        if (!valid) return;
                        keyPress_F4(player);
                        break;
                }
                case KeyType.KEY_Y: {
                        if (!valid) return;
                        keyPress_Y(player);
                        break;
                }
                case KeyType.KEY_CTRL_D: {
                        keyPress_CTRL_D(player);
                        break;
                }
                case KeyType.KEY_F3:
                {
                        if (!valid) return;
                        keyPress_F3(player);
                        break;
                }
                case KeyType.KEY_CTRL_X:
                    {
                        if (!valid) return;
                        keyPress_CTRL_X(player);
                        break;
                    }
                case KeyType.KEY_E:
                    {
                        if (!valid) return;
                        keyPress_E(player);
                        break;
                    }
                case KeyType.KEY_M:
                    {
                        keyPress_M(player);
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
            KEY_CTRL_D,
            KEY_E,
            KEY_CTRL_X,
            KEY_M
        }
    }
}
