using CloudRP.World;
using GTANetworkAPI;
using Newtonsoft.Json;
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
                doorExitPosition = new List<Vector3> {
                    new Vector3(-912.4, -365.0, 114.3)
                },
                interiorPosition = new Vector3(-919.5, -368.7, 114.3),
                name = "Richard Majestic, Apt 2"
            },
            new Interior
            {
                id = 1,
                doorExitPosition = new List<Vector3> {
                    new Vector3(266.0, -1007.5, -101.0)
                },
                interiorPosition = new Vector3(265.1, -1000.9, -99.0),
                name = "Richard Majestic, Apt 2"
            },
        };

        public static void loadInteriorData(House house)
        {
            Vector3 hPos = new Vector3(house.house_position_x, house.house_position_y, house.house_position_z);

            house.houseInterior.doorExitPosition.ForEach(door =>
            {
                MarkersAndLabels.setTextLabel(door, "Exit property use ~y~Y~w~ to interact", 5f, (uint)house.house_id);
                MarkersAndLabels.setPlaceMarker(door, (uint)house.house_id);
                ColShape doorExit = NAPI.ColShape.CreateSphereColShape(door, 2f, (uint)house.house_id);

                doorExit.SetData(_housingInteriorIdentifier, hPos);
                doorExit.SetSharedData(_housingInteriorIdentifier, hPos);
            });
        }


        [ServerEvent(Event.PlayerEnterColshape)]
        public void addInteriorData(ColShape colshape, Player player)
        {
            Vector3 housePos = colshape.GetData<Vector3>(_housingInteriorIdentifier);

            if(housePos != null)
            {
                player.SetData(_housingInteriorIdentifier, housePos);
                player.SetSharedData(_housingInteriorIdentifier, housePos);
            }
        }
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeInteriorData(ColShape colshape, Player player)
        {
            Vector3 housePos = colshape.GetData<Vector3>(_housingInteriorIdentifier);

            if (housePos != null)
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
            public List<Vector3> doorExitPosition;
        }
    }
}
