using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.VehicleParking;
using CloudRP.Vehicles;
using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;

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
                vehicles = new List<DealerVehicle>{
                    new DealerVehicle
                    {
                        spawnName = "kamacho",
                        price = 40000
                    },
                    new DealerVehicle
                    {
                        spawnName = "sultan3",
                        price = 1235
                    },
                    new DealerVehicle
                    {
                        spawnName = "blista",
                        price = 8546345
                    },
                    new DealerVehicle
                    {
                        spawnName = "panto",
                        price = 6000
                    },
                    new DealerVehicle
                    {
                        spawnName = "hakuchou2",
                        price = 600000
                    },
                    new DealerVehicle
                    {
                        spawnName = "issi2",
                        price = 4300
                    },
                    new DealerVehicle
                    {
                        spawnName = "baller8",
                        price = 89000
                    },
                    new DealerVehicle
                    {
                        spawnName = "baller3",
                        price = 45000
                    },
                    new DealerVehicle
                    {
                        spawnName = "dominator3",
                        price = 56000
                    }
                },
                viewPosition = new Vector3(-30.0, -1104.8, 26.4),
                viewRange = 1f
            },
            new DealerShip
            {
                dealerShipId = 1,
                dealershipName = "Vapid",
                position = new Vector3(-202.1, -1158.6, 23.8),
                spawnPosition = new Vector3(-223.6, -1162.2, 23.0),
                vehicles = new List<DealerVehicle>{
                    new DealerVehicle
                    {
                        spawnName = "kamacho",
                        price = 40000
                    },
                    new DealerVehicle
                    {
                        spawnName = "sultan3",
                        price = 1235
                    },
                    new DealerVehicle
                    {
                        spawnName = "blista",
                        price = 8546345
                    },
                    new DealerVehicle
                    {
                        spawnName = "panto",
                        price = 6000
                    },
                    new DealerVehicle
                    {
                        spawnName = "hakuchou2",
                        price = 600000
                    },
                    new DealerVehicle
                    {
                        spawnName = "issi2",
                        price = 4300
                    },
                    new DealerVehicle
                    {
                        spawnName = "baller8",
                        price = 89000
                    },
                    new DealerVehicle
                    {
                        spawnName = "baller3",
                        price = 45000
                    },
                    new DealerVehicle
                    {
                        spawnName = "dominator3",
                        price = 56000
                    }
                },
                viewPosition = new Vector3(-202.1, -1158.6, 23.8),
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
                NAPI.Blip.CreateBlip(595, dealerShip.position, 1.0f, 7, dealerShip.dealershipName, 255, 1.0f, true, 0, 0);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setDealerData(ColShape colshape, Player player)
        {
            DealerShip dealerData = colshape.GetData<DealerShip>(_dealershipIdentifer);

            if (dealerData != null)
            {
                player.SetCustomSharedData(_dealershipIdentifer, dealerData);
                player.SetCustomData(_dealershipIdentifer, dealerData);
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
                player.SetCustomData(_dealerActiveIdentifier, true);
                player.TriggerEvent("dealers:initDealership");
                player.Dimension = (uint)player.Id + 1;
            }
        }

        [RemoteEvent("server:closeDealership")]
        public void serverCloseDealership(Player player)
        {
            DealerShip playerDealerData = player.GetData<DealerShip>(_dealershipIdentifer);
            bool dealerActive = player.GetData<bool>(_dealerActiveIdentifier);

            if(playerDealerData != null && dealerActive)
            {
                player.SetCustomData(_dealerActiveIdentifier, false);
                player.Position = playerDealerData.viewPosition;
                player.Dimension = 0;
            }
        }

        [RemoteEvent("server:purchaseVehicle")]
        public void handlePlayerVehiclePurchase(Player player, string vehName, int spawnColour, string dispName)
        {
            DealerShip playerDealerData = player.GetData<DealerShip>(_dealershipIdentifer);
            bool dealerActive = player.GetData<bool>(_dealerActiveIdentifier);
            DbCharacter charData = player.getPlayerCharacterData(); 
            
            if (playerDealerData != null && dealerActive && charData != null)
            {
                long currentMoney = charData.money_amount;
                DealerVehicle findDealerVeh = playerDealerData.vehicles.Where(veh => veh.spawnName == vehName).FirstOrDefault();
                if(findDealerVeh == null)
                {
                    uiHandling.sendPushNotifError(player, "Vehicle wasn't found.", 6600, true);
                    return;
                }

                long moneyDifference = currentMoney - findDealerVeh.price;
                long priceDifference = findDealerVeh.price - charData.money_amount;

                if (moneyDifference < 0)
                {
                    uiHandling.sendPushNotifError(player, $"You don't have enough money to purchase this vehicle! You need ${priceDifference} more", 6600, true);
                    return;
                }

                if(VehicleParkingUtils.checkIfVehicleInVector(playerDealerData.spawnPosition))
                {
                    uiHandling.sendPushNotifError(player, "There is a vehicle blocking the spawn point!", 6600, true);
                    return;
                }

                charData.money_amount -= findDealerVeh.price;

                (Vehicle buildVeh, DbVehicle vehicleData) = VehicleSystem.buildVehicle(vehName, playerDealerData.spawnPosition, 0, charData.character_id, spawnColour, spawnColour, charData.character_name);
                player.setPlayerCharacterData(charData, true, true);

                player.TriggerEvent("dealers:closeDealership");
                CommandUtils.successSay(player, $"You purchased a new {dispName} for ${findDealerVeh.price}. Your vehicle ~y~has been marked on the map~w~.");

                MarkersAndLabels.addBlipForClient(player, 523, $"Your new vehicle [{vehicleData.numberplate}]", playerDealerData.spawnPosition, 70, 255);
                ChatUtils.formatConsolePrint($"{charData.character_name} purchased a new {dispName} with id #{vehicleData.vehicle_id}", ConsoleColor.Blue);
                
                uiHandling.setLoadingState(player, false);
                uiHandling.pushRouterToClient(player, Browsers.None);
            }

            uiHandling.setLoadingState(player, false);
        }

    }
}
