using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.CustomEvents
{
    public class KeyPressEvents : Script
    {
        public delegate void KeyPressEventsEventHandler(Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured);

        public static event KeyPressEventsEventHandler keyPress_Y;
        public static event KeyPressEventsEventHandler keyPress_F4;

        [RemoteEvent("server:handleKeyPress:Y")]
        public void handleKeyPress_Y(Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured)
        {
            keyPress_Y(player, isInSwitchNative, hasPhoneOut, isPauseMenuActive, isTyping, isInVehicle, isInjured);
        }
        
        [RemoteEvent("server:handleKeyPress:F4")]
        public void handleKeyPress_F4(Player player, bool isInSwitchNative, bool hasPhoneOut, bool isPauseMenuActive, bool isTyping, bool isInVehicle, bool isInjured)
        {
            keyPress_F4(player, isInSwitchNative, hasPhoneOut, isPauseMenuActive, isTyping, isInVehicle, isInjured);
        }
    }
}
