using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.Character;
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
        public static readonly long maxSellPrice = 200000000;
        public static readonly string _playerVehicleDealerDataIdentifier = "playerVehicleDealershipData";
        public static readonly string _dealerColDataIdentifier = "PlayerVehicleDealerColshapeData";
        public static Dictionary<string, Dealer> playerDealerships = new Dictionary<string, Dealer>
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

                ColShape dealer = NAPI.ColShape.CreateSphereColShape(item.Value.sellVehPos, 5f);

                dealer.OnEntityEnterColShape += (col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.SetCustomData(_dealerColDataIdentifier, item);
                    }
                };
                
                dealer.OnEntityExitColShape += (col, player) =>
                {
                    if(col.Equals(dealer))
                    {
                        player.ResetData(_dealerColDataIdentifier);
                    }
                };

                item.Value.vehiclePositions?.ForEach(vehPos =>
                {
                    ColShape vehPosCol = NAPI.ColShape.CreateSphereColShape(vehPos.vehPos, 5f);

                    vehPosCol.OnEntityExitColShape += (col, player) =>
                    {
                        if(col.Equals(vehPosCol) && player.IsInVehicle)
                        {
                            Vehicle targetVeh = player.Vehicle;
                            DbVehicle vehicleData = player.Vehicle.getData();

                            if(vehicleData != null && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1)
                            {
                                player.WarpOutOfVehicle();
                                targetVeh.Position = vehPos.vehPos;
                                targetVeh.Rotation = new Vector3(0, 0, vehPos.vehRot);
                            }
                        }
                    };
                });
            }
        }

        [Command("sellveh", "~y~Use: ~w~/sellveh [price] [description]", GreedyArg = true)]
        public void sellVehicleCommand(Player player, long price, string desc)
        {
            KeyValuePair<string, Dealer> dealerData = player.GetData<KeyValuePair<string, Dealer>>(_dealerColDataIdentifier);

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

                if(dealer.vehiclePositions?.Count > 0 && targetVehicleData != null)
                {
                    bool foundSpot = false;

                    foreach (DealerVehPos vehPosition in dealer.vehiclePositions)
                    {
                        if(vehPosition.vehInSpot == null)
                        {
                            foundSpot = true;

                            if(price > maxSellPrice || price < 1)
                            {
                                CommandUtils.errorSay(player, $"Sell price must be between $1 and ${maxSellPrice}");
                                return;
                            }

                            player.WarpOutOfVehicle();
                            CommandUtils.successSay(player, $"You have sold your vehicle for {ChatUtils.moneyGreen}${price}{ChatUtils.White}!");

                            targetVehicle.Position = vehPosition.vehPos;
                            targetVehicle.Rotation = new Vector3(0, 0, vehPosition.vehRot);
                            targetVehicle.Locked = false;

                            targetVehicleData.dealership_id = dealer.dealerId;
                            targetVehicleData.dealership_price = price;
                            targetVehicleData.dealership_spot_id = vehPosition.spotId;
                            targetVehicleData.dynamic_dealer_spot_id = vehPosition.spotId;
                            targetVehicleData.vehicle_locked = false;

                            vehPosition.vehInSpot = targetVehicleData;

                            targetVehicle.saveVehicleData(targetVehicleData, true);

                            targetVehicle.SetSharedData(_playerVehicleDealerDataIdentifier, true);
                            targetVehicle.SetData(_playerVehicleDealerDataIdentifier, true);
                            break;
                        }
                    }

                    if(!foundSpot)
                    {
                        CommandUtils.errorSay(player, "There are no free spots left in this player dealership.");
                    }
                }
            }
        }

        [Command("getbackveh", "~y~Use: ~w~/getbackveh")]
        public void getBackVeh(Player player)
        {
            if(player.IsInVehicle && player.Vehicle.getData() != null)
            {
                Vehicle targetVehicle = player.Vehicle;
                DbVehicle vehicleData = targetVehicle.getData();
                
                if(vehicleData.dynamic_dealer_spot_id != -1 && vehicleData.dealership_id != -1 && vehicleData.owner_id == player.getPlayerCharacterData()?.character_id)
                {
                    PlayerDealerVehPositions.dealerVehPositions
                        .Where(dealerPos => dealerPos.spotId == vehicleData.dynamic_dealer_spot_id)
                        .FirstOrDefault()
                        .vehInSpot = null;

                    vehicleData.dynamic_dealer_spot_id = -1;
                    vehicleData.dealership_spot_id = -1;
                    vehicleData.dealership_id = -1;

                    targetVehicle.saveVehicleData(vehicleData, true);
                    targetVehicle.ResetSharedData(_playerVehicleDealerDataIdentifier);
                    targetVehicle.ResetData(_playerVehicleDealerDataIdentifier);

                    CommandUtils.successSay(player, $"You got your vehicle [{targetVehicle.NumberPlate}] back from the dealership.");
                } else
                {
                    CommandUtils.errorSay(player, "This vehicle is either not in a dealership or you don't own it.");
                }
            }
        }

        [ServerEvent(Event.PlayerEnterVehicle)]
        public void openDealershipMenu(Player player, Vehicle vehicle, sbyte seatId)
        {
            DbVehicle vehicleData = vehicle.getData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if(characterData != null && vehicleData != null && vehicleData.dealership_id != -1)
            {
                if(characterData.character_id == vehicleData.owner_id)
                {
                    player.SendChatMessage(ChatUtils.info + "You own this vehicle. Use /getbackveh to retrieve it.");
                    player.SendChatMessage(ChatUtils.info + "To view this vehicle's mods or purchase this vehicle use /mods.");
                }
            }
        }

        [RemoteEvent("server:purchasePlayerDealerVehicle")]
        public void purchasePlayerDealerVehicle(Player player)
        {
            if(player.IsInVehicle)
            {
                DbCharacter characterData = player.getPlayerCharacterData();

                if(characterData != null)
                {
                    Vehicle targetVehicle = player.Vehicle;
                    DbVehicle vehicleData = targetVehicle.getData();

                    if (vehicleData != null && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1)
                    {
                        if (vehicleData.owner_id == characterData.character_id)
                        {
                            uiHandling.setLoadingState(player, false, true);
                            CommandUtils.errorSay(player, "You cannot purchase back your own vehicle. Use /getbackveh.");
                            return;
                        }

                        if((characterData.money_amount - vehicleData.dealership_price) < 0)
                        {
                            uiHandling.setLoadingState(player, false, true);
                            CommandUtils.errorSay(player, "You don't have enough money to cover the purchase of this vehicle.");
                            return;
                        }


                        characterData.money_amount -= vehicleData.dealership_price;
                        vehicleData.dynamic_dealer_spot_id = -1;
                        vehicleData.dealership_spot_id = -1;
                        vehicleData.dealership_id = -1;
                        vehicleData.owner_id = characterData.character_id;

                        player.setPlayerCharacterData(characterData, false, true);
                        targetVehicle.saveVehicleData(vehicleData, true);
                        targetVehicle.ResetSharedData(_playerVehicleDealerDataIdentifier);
                        targetVehicle.ResetData(_playerVehicleDealerDataIdentifier);

                        CommandUtils.successSay(player, $"You purchased a vehicle [{targetVehicle.NumberPlate}] for ${vehicleData.dealership_price}");
                    }
                }
            }
        }
    }
}
