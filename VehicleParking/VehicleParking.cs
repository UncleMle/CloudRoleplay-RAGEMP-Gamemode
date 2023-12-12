using CloudRP.ClothingStores;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleParking
{
    public class VehicleParking : Script
    {
        public static string _parkingLotIdentifier = "parkingLotData";
        public static string _retrievalIdentifier = "retreivalParkingData";
        public List<ParkingLot> parkingLots = new List<ParkingLot>
        {
            new ParkingLot
            {
                name = "Mirror Park Parking",
                parkingId = 1,
                park = new ParkCol
                {
                    name = "Mirror Park",
                    owner_id = 1,
                    position = new Vector3(208.8, -808.4, 30.9)
                },
                retrieve = new RetrieveCol
                {
                    name = "Mirror Park",
                    owner_id = 1,
                    position = new Vector3(213.9, -808.5, 31.0)
                },
                parkPosRange = 5f,
                retrievePosRange = 5f
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void populateParkingAreas()
        {
            for(int i = 0; i < parkingLots.Count; i++)
            {
                ParkingLot pLot = parkingLots[i];

                ColShape parkCol = NAPI.ColShape.CreateSphereColShape(pLot.park.position, pLot.parkPosRange, 0);
                ColShape retrieveCol = NAPI.ColShape.CreateSphereColShape(pLot.retrieve.position, pLot.retrievePosRange, 0);

                parkCol.SetData(_parkingLotIdentifier, pLot.park);
                retrieveCol.SetData(_retrievalIdentifier, pLot.retrieve);

                NAPI.TextLabel.CreateTextLabel($"{pLot.name} ~y~Y~w~ to interact", pLot.retrieve.position, 10f, 1.0f, 4, new Color(255, 255, 255, 255), true);
                NAPI.Blip.CreateBlip(831, pLot.park.position, 1.0f, 63, pLot.name, 255, 1.0f, true, 0, 0);
                NAPI.Marker.CreateMarker(27, new Vector3(pLot.park.position.X, pLot.park.position.X, pLot.park.position.Z- 0.9), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setParkingData(ColShape colshape, Player player)
        {
            ParkCol parkCol = colshape.GetData<ParkCol>(_parkingLotIdentifier);
            RetrieveCol retrievalCol = colshape.GetData<RetrieveCol>(_retrievalIdentifier);

            Console.WriteLine("Entered.");

            if (retrievalCol != null)
            {
                player.SetData(_retrievalIdentifier, retrievalCol);
                player.SetSharedData(_retrievalIdentifier, retrievalCol);
                return;
            }
            
            if (parkCol != null)
            {
                player.SetData(_parkingLotIdentifier, parkCol);
                player.SetSharedData(_parkingLotIdentifier, parkCol);
                return;
            }
        }        
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeParkingData(ColShape colshape, Player player)
        {
            ParkCol parkCol = colshape.GetData<ParkCol>(_parkingLotIdentifier);
            RetrieveCol retrievalCol = colshape.GetData<RetrieveCol>(_retrievalIdentifier);

            Console.WriteLine("exited.");

            if (retrievalCol != null || parkCol != null)
            {
                player.ResetData(_parkingLotIdentifier);
                player.ResetData(_retrievalIdentifier);
                player.ResetSharedData(_parkingLotIdentifier);
                player.ResetSharedData(_retrievalIdentifier);
            }
        }


    }
}
