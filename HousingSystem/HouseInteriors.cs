using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using static CloudRP.HousingSystem.Interiors;

namespace CloudRP.HousingSystem
{
    public class Interiors : Script
    {
        public static string _housingInteriorIdentifier = "houseInteriorData";
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

        public static void loadInteriorData(House house)
        {
            Interior interior = house.houseInterior;

            MarkersAndLabels.setTextLabel(interior.doorExitPosition, "Exit property use ~y~Y~w~ to interact", 5f, (uint)house.house_id);
            MarkersAndLabels.setPlaceMarker(interior.doorExitPosition, (uint)house.house_id);
            ColShape doorExit = NAPI.ColShape.CreateSphereColShape(interior.doorExitPosition, 2f, (uint)house.house_id);

            interior.housePosition = new Vector3(house.house_position_x, house.house_position_y, house.house_position_z);
            //house.interiorExitCol = doorExit;

            doorExit.SetData(_housingInteriorIdentifier, interior);
            doorExit.SetSharedData(_housingInteriorIdentifier, interior);

            //HousingSystem.setHouseData(house.houseCol, house);
        }


        [ServerEvent(Event.PlayerEnterColshape)]
        public void addInteriorData(ColShape colshape, Player player)
        {
            Interior interiorData = colshape.GetData<Interior>(_housingInteriorIdentifier);

            if(interiorData != null)
            {
                player.SetData(_housingInteriorIdentifier, interiorData);
                player.SetSharedData(_housingInteriorIdentifier, interiorData);
            }

        }
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeInteriorData(ColShape colshape, Player player)
        {
            Interior interiorData = colshape.GetData<Interior>(_housingInteriorIdentifier);

            if (interiorData != null)
            {
                player.ResetData(_housingInteriorIdentifier);
                player.ResetSharedData(_housingInteriorIdentifier);
            }
        }

        public class Interior
        {
            public int id;
            public string name;
            public Vector3 housePosition;
            public Vector3 interiorPosition;
            public Vector3 doorExitPosition;
        }
    }
}
