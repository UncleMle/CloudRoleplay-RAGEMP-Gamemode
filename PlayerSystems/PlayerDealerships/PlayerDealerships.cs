using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
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
                NAPI.Blip.CreateBlip(523, item.Value.sellVehPos, 5f, 1, item.Key, 255, 1f, true);

                ColShape dealer = NAPI.ColShape.CreateSphereColShape(item.Value.sellVehPos, 1f);

                dealer.OnEntityEnterColShape += ((col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.SetCustomData(dealerColDataIdentifier, item);
                    }
                });
                
                dealer.OnEntityExitColShape += ((col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.ResetData(dealerColDataIdentifier);
                    }
                });
            }
        }
    }
}
