using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
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
            },
            new VehicleWash
            {
                position = new Vector3(18.7, -1392.0, 29.3),
                vehicleWashName = "Strawberry Washes",
                washPrice = 57
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void loadAllWashStations()
        {
            vehicleWashingStations.ForEach(wash =>
            {
                NAPI.Blip.CreateBlip(100, wash.position, 1.0f, 66, wash.vehicleWashName, 255, 20f, true, 0, 0);
                NAPI.Marker.CreateMarker(36, wash.position, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(239, 202, 87, 250), false, 0);
                MarkersAndLabels.setTextLabel(new Vector3(wash.position.X, wash.position.Y, wash.position.Z - 0.4), "Use ~y~/wash~w~ to clean your car!", 6.3f);
                ColShape washCol = NAPI.ColShape.CreateSphereColShape(wash.position, 5f, 0);
                washCol.SetData(_washStationIdentifier, wash);
            });
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void addWashData(ColShape col, Player player)
        {
            VehicleWash washData = col.GetData<VehicleWash>(_washStationIdentifier);

            if(washData != null)
            {
                player.SetData(_washStationIdentifier, washData);
            }
        }
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeWashData(ColShape col, Player player)
        {
            VehicleWash washData = col.GetData<VehicleWash>(_washStationIdentifier);

            if(washData != null)
            {
                player.ResetData(_washStationIdentifier);
            }
        }

        [Command("wash", "~y~Use: ~w~/wash")]
        public void washPlayersVehicle(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            VehicleWash vehicleWashData = player.GetData<VehicleWash>(_washStationIdentifier);

            if(vehicleWashData == null)
            {
                CommandUtils.errorSay(player, "You must be in washing station to use this command.");
                return;
            }

            if(characterData != null)
            {
                if(!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }

                Vehicle targetVehicle = player.Vehicle;
                DbVehicle targetVehicleData = targetVehicle.getData();

                if(targetVehicleData != null)
                {
                    if(targetVehicleData.dirt_level == 0)
                    {
                        CommandUtils.errorSay(player, "This vehicle is already sqeaky clean.");
                        return;
                    }

                    if ((characterData.money_amount - vehicleWashData.washPrice) < 0)
                    {
                        CommandUtils.errorSay(player, "You do not have enough money to pay for this vehicle wash.");
                        return;
                    }

                    characterData.money_amount -= vehicleWashData.washPrice;

                    player.Vehicle.setDirtLevel(0);

                    PlayersData.setPlayerCharacterData(player, characterData, false, true);

                    CommandUtils.successSay(player, "You washed your vehicle [" + targetVehicleData.numberplate + "] for the price of $" + vehicleWashData.washPrice);
                }
            }
        }



    }
}
