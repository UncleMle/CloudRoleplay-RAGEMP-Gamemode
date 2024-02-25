using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.RaycastInteractions
{
    public class RaycastInteraction
    {
        public string[] raycastMenuItems = new string[] { };
	    public Vector3 raycastMenuPosition;
        public Action<Player, string?> targetMethod;
    }
    
    public class RaycastInteractionClient
    {
        public string[] raycastMenuItems = new string[] { };
	    public Vector3 raycastMenuPosition;
    }
}
