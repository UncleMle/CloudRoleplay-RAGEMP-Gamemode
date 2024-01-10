using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public static class PlayerDealerVehicleExtensions
    {
        public static void removePlayerDealerStatus(this Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if(vehicleData != null )
            {
                PlayerDealerVehPositions.dealerVehPositions
                    .Where(dealerPos => dealerPos.spotId == vehicleData.dynamic_dealer_spot_id)
                    .FirstOrDefault()
                    .vehInSpot = null;

                vehicleData.dynamic_dealer_spot_id = -1;
                vehicleData.dealership_spot_id = -1;
                vehicleData.dealership_id = -1;

                vehicle.saveVehicleData(vehicleData, true);

                vehicle.ResetSharedData(PlayerDealerships._playerVehicleDealerDataIdentifier);
                vehicle.ResetData(PlayerDealerships._playerVehicleDealerDataIdentifier);
            }
        }

    }
}
