using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public class PlayerDealerships : Script
    {
        public static readonly string dealerColDataIdentifier = "PlayerVehicleDealerColshapeData";
        public Dictionary<string, Dealer> playerDealerships = new Dictionary<string, Dealer>
        {
            { "Low End Dealer", new Dealer 
            { 
                dealerId = 0,
                sellVehPos = new Vector3(-37.2, -2108.0, 16.7),
                vehiclePositions = PlayerDealerVehPositions.dealerVehPositions
                .Where(dealerV => dealerV.ownerId == 0)
                .ToList()
            } 
            },
            { "High End Dealer", new Dealer 
            { 
                dealerId = 1,
                sellVehPos = new Vector3(-1650.1, -827.3, 10.0),
            } 
            },
        };

        public PlayerDealerships()
        {
            foreach (KeyValuePair<string, Dealer> item in playerDealerships)
            {
                MarkersAndLabels.setTextLabel(item.Value.sellVehPos, "Use /sellveh to sell vehicle.", 15f);
                NAPI.Blip.CreateBlip(523, item.Value.sellVehPos, 1f, 1, item.Key, 255, 1f, true);
                NAPI.Marker.CreateMarker(36, new Vector3(item.Value.sellVehPos.X, item.Value.sellVehPos.Y, item.Value.sellVehPos.Z + 0.09), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(255, 0, 0, 250), false, 0);

                ColShape dealer = NAPI.ColShape.CreateSphereColShape(item.Value.sellVehPos, 1f);

                dealer.OnEntityEnterColShape += (col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.SetCustomData(dealerColDataIdentifier, item);
                    }
                };
                
                dealer.OnEntityExitColShape += (col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.ResetData(dealerColDataIdentifier);
                    }
                };
            }
        }

        [Command("sellveh")]
        public void sellVehicleCommand(Player player)
        {
            KeyValuePair<string, Dealer> dealerData = player.GetData<KeyValuePair<string, Dealer>>(dealerColDataIdentifier);

            if (dealerData.Value != null)
            {
                if(!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }

                Dealer dealer = dealerData.Value;
                Vehicle targetVehicle = player.Vehicle;
                DbVehicle targetVehicleData = player.Vehicle.getData();

                if(dealer.vehiclePositions.Count > 0 && targetVehicleData != null)
                {
                    foreach (DealerVehPos vehPositions in dealer.vehiclePositions)
                    {
                        if(vehPositions.vehInSpot == null)
                        {
                            targetVehicle.Position = vehPositions.vehPos;
                            targetVehicle.Rotation = new Vector3(0, 0, vehPositions.vehRot);
                            break;
                        }
                    }
                }
            }
        }
    }
}
