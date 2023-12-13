using CloudRP.World;
using GTANetworkAPI;
using System.Collections.Generic;

namespace CloudRP.VehicleDealerships
{
    public class VehicleDealershipSystem : Script
    {
        public static string _dealershipIdentifer = "vehicleDealership";

        public static List<DealerShip> dealerships = new List<DealerShip>
        {
            new DealerShip
            {
                dealerShipId = 0,
                dealershipName = "PDM",
                position = new Vector3(-40.5, -1095.5, 35.2),
                spawnPosition = new Vector3(-44.3, -1097.0, 26.4),
                vehicles = new List<string>{ "kamacho", "sultan3" },
                viewPosition = new Vector3(-30.0, -1104.8, 26.4),
                viewRange = 2f
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void loadDealerships()
        {
            
            foreach(DealerShip dealerShip in dealerships)
            {
                ColShape viewingCol = NAPI.ColShape.CreateSphereColShape(dealerShip.viewPosition, dealerShip.viewRange, 0);

                
                viewingCol.SetData(_dealershipIdentifer, dealerShip);
                MarkersAndLabels.setTextLabel(dealerShip.viewPosition, $"{dealerShip.dealershipName} ~y~Y~w~ to interact", dealerShip.viewRange);
                MarkersAndLabels.setPlaceMarker(dealerShip.viewPosition);
                NAPI.Blip.CreateBlip(595, dealerShip.position, 1.0f, 63, dealerShip.dealershipName, 255, 1.0f, true, 0, 0);
            }
        }

    }
}
