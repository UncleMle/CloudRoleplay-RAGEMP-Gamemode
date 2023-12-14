using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.HousingSystem
{
    public class Interiors
    {
        public static List<Interior> availableInteriors = new List<Interior>
        {
            new Interior
            {
                id = 0,
                doorExitPosition = new Vector3(-912.4, -365.0, 114.3),
                interiorPosition = new Vector3(-919.5, -368.7, 114.3),
                name = "Richard Majestic, Apt 2"
            }
        };

        public class Interior
        {
            public int id;
            public string name;
            public House house;
            public Vector3 interiorPosition;
            public Vector3 doorExitPosition;
            public ColShape doorExitCol;
            public TextLabel interiorTextLabel;
            public Marker interiorMarker;
        }
    }
}
