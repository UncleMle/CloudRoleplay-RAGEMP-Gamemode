using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.FactionSystems;
using CloudRP.PlayerSystems.Jobs;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.PlayerDealerships;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleDealerships;
using CloudRP.VehicleSystems.VehicleInsurance;
using CloudRP.VehicleSystems.VehicleParking;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;

namespace CloudRP.VehicleSystems.Vehicles
{
    public static class VehicleExtensions
    {
        public static readonly string _trailerSyncDataKey = "truckerVehicleTrailerData";
        public static readonly string _vehicleTrailerDataKey = "truckerVehicleTrailer";
        public static readonly string _vehicleStalledIdentifier = "vehicleIsStalledDataKey";

        public static void sendVehicleToInsurance(this Vehicle vehicle, bool sendMessageToOwner = false)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                InsuranceArea closestInsuranceToDeath = VehicleSystem.getClosestInsuranceToDeath(vehicle);

                vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
                vehicleData.position_x = closestInsuranceToDeath.spawnPosition.X;
                vehicleData.position_y = closestInsuranceToDeath.spawnPosition.Y;
                vehicleData.position_z = closestInsuranceToDeath.spawnPosition.Z;
                vehicleData.dealership_id = -1;
                vehicleData.dealership_spot_id = -1;
                vehicleData.vehicle_insurance_id = closestInsuranceToDeath.insuranceId;
                vehicleData.vehicle_fuel = 100;
                vehicleData.vehicle_health = 1000;

                vehicle.saveVehicleData(vehicleData, true);

                if(sendMessageToOwner)
                {
                    NAPI.Pools.GetAllPlayers().ForEach(owner =>
                    {
                        if(owner.getPlayerCharacterData()?.character_id == vehicleData.owner_id)
                        {
                            owner.SendChatMessage(ChatUtils.info + $"Your vehicle {vehicleData.vehicle_display_name} [{vehicleData.numberplate}] was destroyed and sent to {closestInsuranceToDeath.insuranceName}.");
                        }
                    });
                }

                VehicleSystem.handleVehicleDeath(vehicle, vehicleData);
                vehicle.Delete();
                ChatUtils.formatConsolePrint($"Vehicle #{vehicleData.vehicle_id} ({vehicleData.vehicle_name}) was saved to {closestInsuranceToDeath.insuranceName}.");
            }
        }

        public static void saveVehicleData(this Vehicle vehicle, DbVehicle vehicleData, bool updateDb = false)
        {
            vehicle.setVehicleData(vehicleData);

            if (updateDb && vehicleData.vehicle_id != -1)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    vehicleData.position_x = vehicle.Position.X;
                    vehicleData.position_y = vehicle.Position.Y;
                    vehicleData.position_z = vehicle.Position.Z;
                    vehicleData.rotation_x = vehicle.Rotation.X;
                    vehicleData.rotation_y = vehicle.Rotation.Y;
                    vehicleData.rotation_z = vehicle.Rotation.Z;

                    vehicleData.vehicle_health = NAPI.Vehicle.GetVehicleBodyHealth(vehicle);

                    dbContext.vehicles.Update(vehicleData);
                    dbContext.SaveChanges();
                }
            }
        }

        public static void setVehicleData(this Vehicle vehicle, DbVehicle vehicleData, bool resyncMods = false, bool resyncDirtLevel = false)
        {
            if (resyncMods)
            {
                vehicleData.vehicle_mods = VehicleSystem.getVehiclesMods(vehicleData.vehicle_id);
                vehicle.SetSharedData(VehicleSystem._vehicleSharedModData, vehicleData.vehicle_mods);
            }

            if (resyncDirtLevel)
            {
                vehicle.SetData(VehicleSystem._vehicleDirtLevelIdentifier, vehicleData.dirt_level);
                vehicle.SetSharedData(VehicleSystem._vehicleDirtLevelIdentifier, vehicleData.dirt_level);
            }

            vehicle.SetSharedData(VehicleSystem._vehicleSharedDataIdentifier, vehicleData);
            vehicle.SetData(VehicleSystem._vehicleSharedDataIdentifier, vehicleData);
        }

        public static bool checkIfVehicleInVector(this Vehicle pVeh, Vector3 pos)
        {
            bool isInVector = false;

            List<Vehicle> onlineVehs = NAPI.Pools.GetAllVehicles();

            foreach (Vehicle vehicle in onlineVehs)
            {
                if (vehicle.Position.X >= pos.X - 2 && vehicle.Position.X <= pos.X + 2 && vehicle.Position.Y >= pos.Y - 2 && vehicle.Position.Y <= pos.Y + 2)
                {
                    isInVector = true;
                }
            }

            return isInVector;
        }

        public static void closeAllDoors(this Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                for (int i = 0; i < vehicleData.vehicle_doors.Length; i++)
                {
                    vehicleData.vehicle_doors[i] = false;
                }

                vehicle.saveVehicleData(vehicleData);
            }
        }
        
        public static void openAllDoors(this Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                for (int i = 0; i < vehicleData.vehicle_doors.Length; i++)
                {
                    vehicleData.vehicle_doors[i] = true;
                }

                vehicle.saveVehicleData(vehicleData);
            }
        }

        public static void closeAllWindows(this Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                for (int i = 0; i < vehicleData.vehicle_windows.Length; i++)
                {
                    vehicleData.vehicle_windows[i] = false;
                }

                vehicle.saveVehicleData(vehicleData);
            }
        }

        public static void setDirtLevel(this Vehicle vehicle, int number)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                vehicleData.dirt_level = number;

                vehicle.setVehicleData(vehicleData, false, true);
            }
        }

        public static void freeze(this Vehicle vehicle, bool toggle)
        {
            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if(p.IsInVehicle && p.Vehicle.Equals(vehicle))
                {
                    p.TriggerEvent("vehicleSystem:freezePlayerVehicle", toggle);
                } 
            });
        }

        public static void setVehicleStalled(this Vehicle vehicle, bool toggle)
        {
            vehicle.SetData(_vehicleStalledIdentifier, toggle);
            vehicle.SetSharedData(_vehicleStalledIdentifier, toggle);

            DbVehicle vehicleData = vehicle.getData();

            if(vehicleData != null)
            {
                vehicleData.engine_status = toggle;

                vehicle.setVehicleData(vehicleData);
            }

        }
        
        public static bool isStalled(this Vehicle vehicle)
        {
            return vehicle.GetData<bool>(_vehicleStalledIdentifier);
        }

        public static DbVehicle getData(this Vehicle vehicle)
        {
            return vehicle.GetData<DbVehicle>(VehicleSystem._vehicleSharedDataIdentifier);
        }

        public static FreeLanceJobVehicleData getFreelanceJobData(this Vehicle vehicle)
        {
            return vehicle.GetExternalData<FreeLanceJobVehicleData>((int)PlayersData.ExternalSlots.VehicleFreelance);
        }
        
        public static void setFreelanceJobData(this Vehicle vehicle, FreeLanceJobVehicleData data)
        {
            vehicle.SetExternalData((int)PlayersData.ExternalSlots.VehicleFreelance, data);
            vehicle.SetSharedData(FreelanceJobSystem._FreelanceJobVehicleDataIdentifier, data);
        }

        public static void resyncSharedData(this Vehicle vehicle)
        {
            if(vehicle.getFreelanceJobData() != null)
            {
                vehicle.SetSharedData(FreelanceJobSystem._FreelanceJobVehicleDataIdentifier, vehicle.getFreelanceJobData());
            }

            if(vehicle.getData() != null)
            {
                vehicle.SetSharedData(VehicleSystem._vehicleSharedDataIdentifier, vehicle.getData());
            }
        }

        public static void addSyncedTrailer(this Vehicle vehicle, string trailerName)
        {
            Vector3 vehRot = vehicle.Rotation;

            vehicle.SetSharedData(_trailerSyncDataKey, trailerName);

            NAPI.Task.Run(() =>
            {
                if(vehicle.Exists)
                {
                    vehicle.Rotation = vehRot;
                }
            }, 1000);
        }

        public static void sayInfoAboutVehicle(this Vehicle vehicle, Player player)
        {
            User userData = player.getPlayerAccountData();
            DbVehicle vehicleData = vehicle.getData();

            if (userData != null && vehicleData != null)
            {

                player.SendChatMessage(ChatUtils.yellow + "-----------------------------------------------------------");
                AdminUtils.staffSay(player, "Vehicle id: " + ChatUtils.red + (vehicleData.vehicle_id == -1 ? "N/A" : $"{vehicleData.vehicle_id}") + AdminUtils.staffSuffixColour + " VehName: " + ChatUtils.red + vehicleData.vehicle_name);
                AdminUtils.staffSay(player, "Vehicle Display Name: " + ChatUtils.red + vehicleData.vehicle_display_name + AdminUtils.staffSuffixColour + " Doors: " + ChatUtils.red + JsonConvert.SerializeObject(vehicleData.vehicle_doors));
                AdminUtils.staffSay(player, "Owner id: " + ChatUtils.red + (vehicleData.owner_id == -1 ? "N/A" : $"{vehicleData.owner_id}") + AdminUtils.staffSuffixColour + " Numberplate: " + ChatUtils.red + vehicleData.numberplate);
                AdminUtils.staffSay(player, "Vehicle Dimension: " + ChatUtils.red + vehicleData.vehicle_dimension + AdminUtils.staffSuffixColour + " Lock Status: " + ChatUtils.red + vehicleData.vehicle_locked);
                AdminUtils.staffSay(player, "Mileage: " + ChatUtils.red + (vehicleData.vehicle_distance / 1609).ToString("N0") + " Miles" + AdminUtils.staffSuffixColour + " Fuel Level: " + ChatUtils.red + vehicleData.vehicle_fuel.ToString("N1") + "%");

                if (vehicleData.dealership_id != -1)
                {
                    KeyValuePair<string, Dealer> dealership = PlayerDealerships.playerDealerships
                        .Where(dealer => dealer.Value.dealerId == vehicleData.dealership_id)
                        .FirstOrDefault();

                    if(dealership.Value != null)
                    {
                        AdminUtils.staffSay(player, $"Market status: {ChatUtils.moneyGreen}true{AdminUtils.staffSuffixColour} Market: {dealership.Key}");
                    }
                }

                if ((userData.adminDuty || userData.admin_status > (int)AdminRanks.Admin_HeadAdmin))
                {
                    AdminUtils.staffSay(player, "Owner: " + ChatUtils.red + vehicleData.owner_name);
                }

                AdminUtils.staffSay(player, "Class: " + ChatUtils.red + vehicleData.vehicle_class_id + AdminUtils.staffSuffixColour + " Insurance Status: " + (vehicleData.insurance_status ? ChatUtils.moneyGreen + "Insured" : ChatUtils.red + "Not insured"));
                
                if(vehicleData.faction_owner_id != -1)
                {
                    AdminUtils.staffSay(player, $"Faction Vehicle: {ChatUtils.red}{FactionSystem.getFactionName(vehicleData.faction_owner_id)} Faction");
                }

                player.SendChatMessage(ChatUtils.yellow + "-----------------------------------------------------------");
            }
        }

        public static void toggleLock(this Vehicle vehicle, bool toggle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                vehicleData.vehicle_locked = toggle;

                vehicle.Locked = vehicleData.vehicle_locked;

                if (vehicle.Locked)
                {
                    vehicle.closeAllDoors();
                    vehicle.closeAllWindows();
                }

                vehicle.saveVehicleData(vehicleData);
            }
        }

        public static bool isBlockingSpotInRange(this Vehicle vehicle, Vector3 spot)
        {
            return vehicle.Position.DistanceToSquared(spot) < 10;
        }

        public static void parkVehicle(this Vehicle vehicle, Player player, int garageId)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData == null) return;

            vehicleData.vehicle_dimension = VehicleDimensions.Garage;
            vehicleData.vehicle_garage_id = garageId;

            vehicle.saveVehicleData(vehicleData, true);

            VehicleSystem.handleVehiclePark(vehicle, vehicleData);

            CommandUtils.successSay(player, $"You parked your vehicle [{vehicleData.numberplate}]");
            vehicle.Delete();
        }

        public static void scrapVehicle(this Vehicle vehicle, Player player)
        {
            DbVehicle vehicleData = vehicle.getData();
            DbCharacter character = player.getPlayerCharacterData();

            if (vehicleData == null || character == null) return;

            if (vehicleData.owner_id != character.character_id)
            {
                CommandUtils.errorSay(player, "You must be the owner of the vehicle to scrap it.");
                return;
            }

            VehicleSystem.handleVehicleDeath(vehicle, vehicleData);
            CommandUtils.successSay(player, $"You've scrapped your vehicle [{vehicleData.vehicle_display_name}] ({vehicleData.numberplate})");

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicles.Remove(vehicleData);
                dbContext.vehicle_mods.Remove(vehicleData.vehicle_mods);

                vehicleData.vehicle_key_holders?.ForEach(keyHolder =>
                {
                    dbContext.vehicle_keys.Remove(keyHolder);
                });

                dbContext.SaveChanges();
            }
            vehicle.Delete();
        }
    }
}
