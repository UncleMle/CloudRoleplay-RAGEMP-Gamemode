using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Database;
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
        public static readonly long highEndMinSellPrice = 50000;
        public static readonly long lowEndMinSellPrice = 5000;
        public static readonly string _playerVehicleDealerDataIdentifier = "playerVehicleDealershipData";
        public static readonly string _playerDealerPurchaseData = "playerVehiclePurchaseVehicleData";
        public static readonly string _dealerColDataIdentifier = "PlayerVehicleDealerColshapeData";
        public static Dictionary<string, Dealer> playerDealerships = new Dictionary<string, Dealer>
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

                DbCharacter characterData = player.getPlayerCharacterData();
                Dealer dealer = dealerData.Value;
                Vehicle targetVehicle = player.Vehicle;
                DbVehicle targetVehicleData = player.Vehicle.getData();

                if(dealer.vehiclePositions?.Count > 0 && targetVehicleData != null && characterData != null)
                {
                    if(characterData.character_id != targetVehicleData.owner_id && player.getAdmin() < (int)AdminRanks.Admin_Developer)
                    {
                        CommandUtils.errorSay(player, "You must be the owner of this vehicle to sell it.");
                        return;
                    }

                    long dealerMinSellPrice = 0;

                    if(dealer.type == DealershipType.highEnd)
                    {
                        dealerMinSellPrice = highEndMinSellPrice;
                    } else if(dealer.type == DealershipType.lowEnd)
                    {
                        dealerMinSellPrice = lowEndMinSellPrice;
                    }

                    bool foundSpot = false;

                    foreach (DealerVehPos vehPosition in dealer.vehiclePositions)
                    {
                        if(vehPosition.vehInSpot == null && VehicleSystem.checkVehInSpot(vehPosition.vehPos, 8) == null)
                        {
                            foundSpot = true;

                            if(price > maxSellPrice || price < dealerMinSellPrice)
                            {
                                CommandUtils.errorSay(player, $"Sell price must be between ${dealerMinSellPrice} and ${maxSellPrice}");
                                return;
                            }

                            if(!AuthUtils.validateNick(desc))
                            {
                                CommandUtils.errorSay(player, "Dealer descriptions cannot have certain special characters.");
                                return;
                            }

                            if(desc.Length > 256)
                            {
                                CommandUtils.errorSay(player, "Dealer descriptions cannot be longer than 256 characters.");
                                return;
                            }

                            player.WarpOutOfVehicle();
                            CommandUtils.successSay(player, $"You have sold your vehicle for {ChatUtils.moneyGreen}${price}{ChatUtils.White}!");

                            targetVehicle.Position = vehPosition.vehPos;
                            targetVehicle.Rotation = new Vector3(0, 0, vehPosition.vehRot);
                            targetVehicle.Locked = false;

                            targetVehicleData.rotation = (float)vehPosition.vehRot;
                            targetVehicleData.dealership_id = dealer.dealerId;
                            targetVehicleData.dealership_price = price;
                            targetVehicleData.dealership_description = desc;
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

        [Command("d")]
        public void dealeraddcomd(Player player)
        {
            if(player.getAdmin() > 7)
            {
                Console.WriteLine(",\r\n            new DealerVehPos\r\n            {\r\n                ownerId = 0,\r\n                spotId = 29,\r\n                vehPos = new Vector3("+player.Position.X+","+player.Position.Y+" ,"+ player.Position.Z+"),\r\n                vehRot = "+player.Rotation.Z+"\r\n            } ");

            }
        }

        [RemoteEvent("server:purchasePlayerDealerVehicle")]
        public void purchasePlayerDealerVehicle(Player player)
        {
            if(player.IsInVehicle)
            {
                DbCharacter characterData = player.getPlayerCharacterData();
                KeyValuePair<string, Dealer> dealerData = player.GetData<KeyValuePair<string, Dealer>>(_playerDealerPurchaseData);

                if(characterData != null && dealerData.Value != null)
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

                        uiHandling.setLoadingState(player, false, true);
                        CommandUtils.successSay(player, $"You purchased a vehicle [{targetVehicle.NumberPlate}] for ${vehicleData.dealership_price}");
                    }
                }
            }
        }

        public static void setSpotActiveWithVehicle(DbVehicle vehicleData, int spotId)
        {
            PlayerDealerVehPositions.dealerVehPositions
                    .Where(dealerPos => dealerPos.spotId == spotId)
                    .FirstOrDefault()
                    .vehInSpot = vehicleData;
        }
    }
}
