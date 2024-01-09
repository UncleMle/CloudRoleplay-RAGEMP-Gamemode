using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.World.MarkersLabels
{
    public class MarkersAndLabels
    {
        public static TextLabel setTextLabel(Vector3 position, string text, float range, uint dim = 0)
        {
            return NAPI.TextLabel.CreateTextLabel(text, position, range, 1.0f, 4, new Color(255, 255, 255, 255), true, dim);
        }

        public static Marker setPlaceMarker(Vector3 position, uint dim = 0)
        {
            return NAPI.Marker.CreateMarker(27, new Vector3(position.X, position.Y, position.Z - 0.92), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, dim);
        }

        public static void addBlipForClient(Player target, int blipSprite, string name, Vector3 pos, int colour, int alpha = 255, int timeout = 60)
        {
            target.TriggerEvent("clientBlip:addClientBlip", blipSprite, name, pos, colour, alpha, timeout);
        }
    }
}
