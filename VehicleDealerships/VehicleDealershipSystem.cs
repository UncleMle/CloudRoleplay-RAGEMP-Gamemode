using CloudRP.PlayerData;
using CloudRP.World;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;

namespace CloudRP.VehicleDealerships
{
    public class VehicleDealershipSystem : Script
    {
        public static string _dealershipIdentifer = "vehicleDealership";
        public static string _dealerActiveIdentifier = "vehicleDealershipIsActive";

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
                viewRange = 1f
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

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setDealerData(ColShape colshape, Player player)
        {
            DealerShip dealerData = colshape.GetData<DealerShip>(_dealershipIdentifer);

            if (dealerData != null)
            {
                player.SetSharedData(_dealershipIdentifer, dealerData);
                player.SetData(_dealershipIdentifer, dealerData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeDealerData(ColShape colshape, Player player)
        {
            DealerShip dealerData = colshape.GetData<DealerShip>(_dealershipIdentifer);
            bool dealerActive = player.GetData<bool>(_dealerActiveIdentifier);

            if (dealerData != null && !dealerActive)
            {
                player.ResetData(_dealershipIdentifer);
                player.ResetSharedData(_dealershipIdentifer);
            }
        }

        [RemoteEvent("server:viewDealerVehicles")]
        public void serverViewDealerVehicles(Player player)
        {
            DealerShip dealerData = player.GetData<DealerShip>(_dealershipIdentifer);
            bool dealerActive = player.GetData<bool>(_dealerActiveIdentifier);

            if (dealerData != null && !dealerActive)
            {
                player.SetData(_dealerActiveIdentifier, true);
                player.TriggerEvent("dealers:initDealership");
                player.Dimension = (uint)player.Id + 1;

                Console.WriteLine("Player can access dealer view with ID " + dealerData.dealerShipId);
            }
        }

        [RemoteEvent("server:closeDealership")]
        public void serverCloseDealership(Player player)
        {
            DealerShip playerDealerData = player.GetData<DealerShip>(_dealershipIdentifer);
            bool dealerActive = player.GetData<bool>(_dealerActiveIdentifier);

            if(playerDealerData != null && dealerActive)
            {
                player.SetData(_dealerActiveIdentifier, false);
                player.Position = playerDealerData.viewPosition;
                player.Dimension = 0;
            }
        }

    }
}
