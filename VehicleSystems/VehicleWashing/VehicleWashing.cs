using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.VehicleSystems.VehicleScrapyards;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleSystems.VehicleWashing
{
    public class VehicleWashing : Script
    {
        public static string _washStationIdentifier = "vehicleWashStation";
        public static List<VehicleWash> vehicleWashingStations = new List<VehicleWash>
        {
            new VehicleWash { position = new Vector3(-699.8, -933.4, 19.0), vehicleWashName = "Weazel Car Wash", washPrice = 23 },
            new VehicleWash { position = new Vector3(18.7, -1392.0, 29.3), vehicleWashName = "Strawberry Car Wash", washPrice = 57 },
            new VehicleWash { position = new Vector3(-234.6, -1396.4, 31.3), vehicleWashName = "Innocence Car Wash", washPrice = 12 },
            new VehicleWash { position = new Vector3(1373.2, 3619.0, 34.9), vehicleWashName = "Sandy Car Wash", washPrice = 20 }
        };

        public VehicleWashing()
        {
            vehicleWashingStations.ForEach(wash =>
            {
                NAPI.Blip.CreateBlip(100, wash.position, 1.0f, 66, wash.vehicleWashName, 255, 20f, true, 0, 0);
                NAPI.Marker.CreateMarker(36, wash.position, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(239, 202, 87, 250), false, 0);
                MarkersAndLabels.setTextLabel(new Vector3(wash.position.X, wash.position.Y, wash.position.Z - 0.4), "Use ~y~/wash~w~ to clean your car!", 6.3f);
                ColShape washCol = NAPI.ColShape.CreateSphereColShape(wash.position, 5f, 0);
                washCol.SetData(_washStationIdentifier, wash);

                washCol.OnEntityEnterColShape += (col, player) =>
                {
                    if(col.Equals(washCol))
                    {
                        player.SetCustomData(_washStationIdentifier, wash);
                    }
                };

                washCol.OnEntityExitColShape += (col, player) =>
                {
                    if (col.Equals(washCol))
                    {
                        player.ResetData(_washStationIdentifier);
                    }
                };
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {vehicleWashingStations.Count} vehicle washing stations were loaded in.");
        }

        [Command("wash", "~y~Use: ~w~/wash")]
        public void washPlayersVehicle(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            VehicleWash vehicleWashData = player.GetData<VehicleWash>(_washStationIdentifier);

            if (vehicleWashData == null)
            {
                CommandUtils.errorSay(player, "You must be in washing station to use this command.");
                return;
            }

            if (characterData != null)
            {
                if (!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }

                Vehicle targetVehicle = player.Vehicle;
                DbVehicle targetVehicleData = targetVehicle.getData();

                if (targetVehicleData != null)
                {
                    if (targetVehicleData.dirt_level == 0)
                    {
                        CommandUtils.errorSay(player, "This vehicle is already sqeaky clean.");
                        return;
                    }

                    if (!player.processPayment(vehicleWashData.washPrice, "Vehicle Washing Charge"))
                    {
                        CommandUtils.errorSay(player, "You do not have enough money to pay for this vehicle wash.");
                        return;
                    }


                    player.Vehicle.setDirtLevel(0);
                    CommandUtils.successSay(player, "You washed your vehicle [" + targetVehicleData.numberplate + "] for the price of $" + vehicleWashData.washPrice);
                }
            }
        }



    }
}
