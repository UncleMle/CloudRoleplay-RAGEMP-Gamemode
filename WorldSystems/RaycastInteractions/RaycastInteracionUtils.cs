using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.RaycastInteractions
{
    public class RaycastInteraction
    {
        public string menuTitle { get; set; } = "Interaction Point";
        public List<string> raycastMenuItems = new List<string>();
	    public Vector3 raycastMenuPosition;
        public Action<Player, string?> targetMethod;
        public bool hasPlaceMarker { get; set; } = true;
    }
    
    public class RaycastInteractionClient
    {
        public string menuTitle { get; set; }
        public List<string> raycastMenuItems = new List<string>();
	    public Vector3 raycastMenuPosition;
    }
}
