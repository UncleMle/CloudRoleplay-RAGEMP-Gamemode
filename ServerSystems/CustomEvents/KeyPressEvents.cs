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
        #endregion

        #region Remote Events
        [RemoteEvent("server:handleKeyPress")]
        public void handleKeyPress(Player player, int key)
        {
            switch (key)
            {
                case (int)KeyType.KEY_F4: {
                        keyPress_F4(player);
                        break;
                }
                case (int)KeyType.KEY_Y: {
                        keyPress_Y(player);
                        break;
                }
                default:
                    {
                        ChatUtils.formatConsolePrint("Key not found " + key);
                        break;
                    }
            }
        }

        #endregion

        public enum KeyType
        {
            KEY_Y,
            KEY_F4,
        }
    }
}
