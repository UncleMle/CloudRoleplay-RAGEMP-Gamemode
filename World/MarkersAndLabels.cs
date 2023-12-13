using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.World
{
    public class MarkersAndLabels
    {
        public static void setTextLabel(Vector3 position, string text, float range)
        {
            NAPI.TextLabel.CreateTextLabel(text, position, range, 1.0f, 4, new Color(255, 255, 255, 255), true);
        }
        
        public static void setPlaceMarker(Vector3 position)
        {
            NAPI.Marker.CreateMarker(27, new Vector3(position.X, position.Y, position.Z - 0.9), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
        }
    }
}
