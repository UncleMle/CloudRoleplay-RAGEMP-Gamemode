using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleWashing
{
    public class VehicleWashing : Script
    {
        public static string _washStationIdentifier = "vehicleWashStation";
        public static List<VehicleWash> vehicleWashingStations = new List<VehicleWash>
        {
            new VehicleWash
            {
                position = new Vector3(-699.8, -933.4, 19.0),
                vehicleWashName = "Weazel Washes",
                washPrice = 23
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void loadAllWashStations()
        {
            vehicleWashingStations.ForEach(wash =>
            {
                NAPI.Blip.CreateBlip(474, wash.position, 1.0f, 66, wash.vehicleWashName, 255, 20f, true, 0, 0);
                MarkersAndLabels.setTextLabel(wash.position, wash.vehicleWashName, 8f);
                NAPI.Marker.CreateMarker(36, wash.position, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(239, 202, 87, 250), false, 0);
            });
        }

    }
}
