﻿using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Logging;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using static System.Net.Mime.MediaTypeNames;

namespace CloudRP.PlayerSystems.PlayerDealerships
{
    public class PlayerDealerships : Script
    {
        public static readonly long maxSellPrice = 200000000;
        public static readonly long highEndMinSellPrice = 50000;
        public static readonly long lowEndMinSellPrice = 5000;
        public static readonly string _playerVehicleDealerDataIdentifier = "playerVehicleDealershipData";
        public static readonly string _playerDealerPurchaseData = "playerVehiclePurchaseVehicleData";
        public static readonly string _dealerColDataIdentifier = "PlayerVehicleDealerColshapeData";

        public static readonly Dictionary<string, Dealer> playerDealerships = new Dictionary<string, Dealer>
        {
            { "Low End Dealer - LS", new Dealer
            {
                dealerId = 0,
                type = DealershipType.lowEnd,
                sellVehPos = new Vector3(-37.2, -2108.0, 16.7),
                vehiclePositions = PlayerDealerVehPositions.dealerVehPositions
                .Where(dealerV => dealerV.ownerId == 0)
                .ToList()
            } 
            },
            { "High End Dealer - LS", new Dealer 
            { 
                dealerId = 1,
                sellVehPos = new Vector3(-1650.1, -827.3, 10.0),
                type = DealershipType.highEnd,
                vehiclePositions = PlayerDealerVehPositions.dealerVehPositions
                .Where(dealerV => dealerV.ownerId == 1)
                .ToList()
            }
            },
            { "High End Dealer - Paleto", new Dealer 
            { 
                dealerId = 2,
                type = DealershipType.highEnd,
                sellVehPos = new Vector3(89.8, 6375.7, 31.2),
                vehiclePositions = PlayerDealerVehPositions.dealerVehPositions
                .Where(dealerV => dealerV.ownerId == 2)
                .ToList()
            }
            },
        };

        public PlayerDealerships()
        {
            foreach (KeyValuePair<string, Dealer> item in playerDealerships)
            {
                MarkersAndLabels.setTextLabel(new Vector3(item.Value.sellVehPos.X, item.Value.sellVehPos.Y, item.Value.sellVehPos.Z - 0.06), $"~r~{item.Key}~w~\nUse /sellveh to sell vehicle.", 15f);
                NAPI.Blip.CreateBlip(523, item.Value.sellVehPos, 1f, 1, item.Key, 255, 1f, true, 0, 0);
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
                    Vector3 pos = vehPos.vehPos;

                    NAPI.TextLabel.CreateTextLabel("~r~No Park Zone.\n(Vehicles Will be towed to insurance)", new Vector3(pos.X, pos.Y, pos.Z - 0.17), 15f, 0.1f, 4, new Color(255, 255, 255, 255), true, 0);

                    ColShape vehPosCol = NAPI.ColShape.CreateSphereColShape(pos, 8f);

                    vehPosCol.OnEntityEnterColShape += (col, player) =>
                    {
                        if(col.Equals(vehPosCol))
                        {
                            player.SetCustomData(_playerDealerPurchaseData, item);
                        }
                    };

                    vehPosCol.OnEntityExitColShape += (col, player) =>
                    {
                        if(col.Equals(vehPosCol))
                        {
                            player.ResetData(_playerDealerPurchaseData);

                            if (player.IsInVehicle)
                            {
                                Vehicle targetVeh = player.Vehicle;
                                DbVehicle vehicleData = player.Vehicle.getData();

                                if (vehicleData != null && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1)
                                {
                                    player.WarpOutOfVehicle();
                                    targetVeh.Position = vehPos.vehPos;
                                    targetVeh.Rotation = new Vector3(0, 0, vehPos.vehRot);
                                }
                            }
                        }
                    };
                });
            }

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {playerDealerships.Count} player dealerships were loaded.");
        }

        [Command("sellveh", "~y~Use: ~w~/sellveh [price] [description]", GreedyArg = true)]
        public void sellVehicleCommand(Player player, int price, string desc)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            KeyValuePair<string, Dealer> dealerData = player.GetData<KeyValuePair<string, Dealer>>(_dealerColDataIdentifier);

            if (dealerData.Value == null) return;

            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbVehicle vehicleData = player.Vehicle.getData();

            if(vehicleData == null || vehicleData != null && vehicleData.owner_id != character.character_id || vehicleData != null && vehicleData.vehicle_id == -1)
            {
                CommandUtils.errorSay(player, $"You must be the owner the vehicle to sell it.");
                return;
            }

            uiHandling.sendPrompt(player, "fa-solid fa-car", "Sell Vehicle", $"Are you sure you want to sell your {vehicleData.vehicle_display_name} for ${price.ToString("N0")}?", sellPlayerVehicle, new DealerSellData
            {
                desc = desc,
                price = price,
            });
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
                    targetVehicle.removePlayerDealerStatus();
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
                }

                NAPI.Native.SendNativeToPlayer(player, Hash.FREEZE_ENTITY_POSITION, vehicle, true);

                player.SendChatMessage(ChatUtils.info + "To view this vehicle's mods or purchase this vehicle use /mods.");
            }
        }

        [ServerEvent(Event.PlayerExitVehicle)]
        public void onPlayerExitVehicle(Player player, Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if(vehicleData != null && vehicleData.dealership_id != -1)
            {
                DealerVehPos vehSpot = PlayerDealerVehPositions.dealerVehPositions
                    .Where(spot => spot.spotId == vehicleData.dealership_spot_id)
                    .FirstOrDefault();

                if(vehSpot != null)
                {
                    vehicle.Position = vehSpot.vehPos;
                    vehicle.Rotation = new Vector3(0, 0, vehSpot.vehRot);
                }
            }
        }

        public void sellPlayerVehicle(Player player, object data)
        {
            KeyValuePair<string, Dealer> dealerData = player.GetData<KeyValuePair<string, Dealer>>(_dealerColDataIdentifier);
            DealerSellData sellData = (DealerSellData)data; 

            if (dealerData.Value != null)
            {
                if (!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }

                DbCharacter characterData = player.getPlayerCharacterData();
                Dealer dealer = dealerData.Value;
                Vehicle targetVehicle = player.Vehicle;
                DbVehicle targetVehicleData = player.Vehicle.getData();

                if (dealer.vehiclePositions?.Count > 0 && targetVehicleData != null && targetVehicleData.vehicle_id != -1 && characterData != null)
                {
                    if (characterData.character_id != targetVehicleData.owner_id && player.getAdmin() < (int)AdminRanks.Admin_Developer)
                    {
                        CommandUtils.errorSay(player, "You must be the owner of this vehicle to sell it.");
                        return;
                    }

                    long dealerMinSellPrice = dealer.type == DealershipType.highEnd ? highEndMinSellPrice : lowEndMinSellPrice;

                    bool foundSpot = false;

                    foreach (DealerVehPos vehPosition in dealer.vehiclePositions)
                    {
                        if (vehPosition.vehInSpot == null)
                        {
                            foundSpot = true;

                            if (sellData.price > maxSellPrice || sellData.price < dealerMinSellPrice)
                            {
                                uiHandling.sendPushNotifError(player, $"Sell price must be between ${dealerMinSellPrice} and ${maxSellPrice}", 6600);
                                return;
                            }

                            if (!AuthUtils.validateNick(sellData.desc))
                            {
                                uiHandling.sendPushNotifError(player, "Dealer descriptions cannot have certain special characters.", 6600);
                                return;
                            }

                            if (sellData.desc.Length > 256)
                            {
                                uiHandling.sendPushNotifError(player, "Dealer descriptions cannot be longer than 256 characters.", 6600);
                                return;
                            }

                            Vehicle blockingSpot = VehicleSystem.checkVehInSpot(vehPosition.vehPos, 8);

                            if (blockingSpot != null && blockingSpot.getData() != null && blockingSpot.getData().dealership_id == -1)
                            {
                                blockingSpot.sendVehicleToInsurance();
                            }

                            NAPI.Pools.GetAllPlayers().ForEach(p =>
                            {
                                if (p.IsInVehicle && p.Vehicle.Equals(targetVehicle))
                                {
                                    p.WarpOutOfVehicle();
                                }
                            });
                            CommandUtils.successSay(player, $"You have sold your vehicle for {ChatUtils.moneyGreen}${sellData.price.ToString("N0")}{ChatUtils.White}!");

                            targetVehicle.Position = vehPosition.vehPos;
                            targetVehicle.Rotation = new Vector3(0, 0, vehPosition.vehRot);
                            targetVehicle.Locked = false;

                            targetVehicleData.rotation = (float)vehPosition.vehRot;
                            targetVehicleData.dealership_id = dealer.dealerId;
                            targetVehicleData.dealership_price = sellData.price;
                            targetVehicleData.dealership_description = sellData.desc;
                            targetVehicleData.dealership_spot_id = vehPosition.spotId;
                            targetVehicleData.dynamic_dealer_spot_id = vehPosition.spotId;
                            targetVehicleData.vehicle_locked = false;

                            vehPosition.vehInSpot = targetVehicleData;

                            targetVehicle.saveVehicleData(targetVehicleData, true);

                            targetVehicle.SetSharedData(_playerVehicleDealerDataIdentifier, true);
                            targetVehicle.SetData(_playerVehicleDealerDataIdentifier, true);

                            setSpotActiveWithVehicle(targetVehicleData, vehPosition.spotId);
                            break;
                        }
                    }

                    if (!foundSpot)
                    {
                        uiHandling.sendPushNotifError(player, "There are no free spots left in this dealership", 6600);
                    }
                }
            }
        }

        [RemoteEvent("server:purchasePlayerDealerVehicle")]
        public void purchasePlayerDealerVehicle(Player player)
        {
            if(player.IsInVehicle)
            {
                DbCharacter characterData = player.getPlayerCharacterData();

                if (characterData != null)
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

                        if(!player.processPayment(vehicleData.dealership_price, "Vehicle Dealership Purchase"))
                        {
                            uiHandling.setLoadingState(player, false, true);
                            CommandUtils.errorSay(player, "You don't have enough money to cover the purchase of this vehicle.");
                            return;
                        }

                        using (DefaultDbContext dbContext = new DefaultDbContext())
                        {
                            DbCharacter findCharacter = dbContext.characters
                                .Where(character => character.character_id == vehicleData.owner_id)
                                .FirstOrDefault();

                            if(findCharacter != null)
                            {
                                findCharacter.money_amount += vehicleData.dealership_price;
                                dbContext.Update(findCharacter);
                                dbContext.SaveChanges();

                                NAPI.Pools.GetAllPlayers().ForEach(p =>
                                {
                                    if(p.getPlayerCharacterData() != null && p.getPlayerCharacterData().character_id == vehicleData.owner_id)
                                    {
                                        p.setPlayerCharacterData(findCharacter, false, true);
                                        p.SendChatMessage($"{ChatUtils.info} {characterData.character_name} has brought your vehicle [{vehicleData.numberplate}] for ${vehicleData.dealership_price}!");
                                    }
                                });
                            }
                        }

                        vehicleData.owner_name = characterData.character_name;
                        vehicleData.owner_id = characterData.character_id;

                        player.setPlayerCharacterData(characterData, false, true);
                        targetVehicle.saveVehicleData(vehicleData, true);
                        targetVehicle.removePlayerDealerStatus();

                        ServerLogging.addNewLog(characterData.character_id, "Vehicle Market Purchase", $"{characterData.character_name} purchase a {vehicleData.vehicle_display_name} for ${vehicleData.dealership_price.ToString("N0")}.", LogTypes.AssetPurchase);

                        uiHandling.setLoadingState(player, false, true);
                        CommandUtils.successSay(player, $"You purchased a vehicle [{targetVehicle.NumberPlate}] for ${vehicleData.dealership_price}");
                    }
                }

                uiHandling.setLoadingState(player, false, true);
            }
        }

        public static void setSpotActiveWithVehicle(DbVehicle vehicleData, int spotId) =>   
            PlayerDealerVehPositions.dealerVehPositions
                    .Where(dealerPos => dealerPos.spotId == spotId)
                    .FirstOrDefault()
                    .vehInSpot = vehicleData;
    }
}
