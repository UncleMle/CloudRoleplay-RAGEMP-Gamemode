using CloudRP.Database;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.Vehicles
{
    public static class VehicleExtensions
    {
        public static void sendVehicleToInsurance(this Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
                vehicleData.UpdatedDate = DateTime.Now;
                vehicleData.vehicle_health = 1000;
                vehicleData.vehicle_fuel = 100;

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicles.Update(vehicleData);
                    dbContext.SaveChanges();
                }

                vehicle.Delete();

                return;
            }
        }

        public static void saveVehicleData(this Vehicle vehicle, DbVehicle vehicleData, bool updateDb = false)
        {
            setVehicleData(vehicle, vehicleData);

            if (updateDb)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    vehicleData.position_x = vehicle.Position.X;
                    vehicleData.position_y = vehicle.Position.Y;
                    vehicleData.position_z = vehicle.Position.Z;
                    vehicleData.rotation = vehicle.Rotation.Z;
                    vehicleData.vehicle_health = NAPI.Vehicle.GetVehicleBodyHealth(vehicle);

                    dbContext.vehicles.Update(vehicleData);
                    dbContext.SaveChanges();
                }
            }
        }

        public static void setVehicleData(this Vehicle vehicle, DbVehicle vehicleData, bool resyncMods = false, bool resyncDirtLevel = false)
        {
            if(resyncMods)
            {
                vehicleData.vehicle_mods = VehicleSystem.getVehiclesMods(vehicleData.vehicle_id);
                vehicle.SetSharedData(VehicleSystem._vehicleSharedModData, vehicleData.vehicle_mods);
                vehicle.SetData(VehicleSystem._vehicleSharedDataIdentifier, vehicleData.vehicle_mods);
            }

            if(resyncDirtLevel)
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
                if ((vehicle.Position.X >= pos.X - 2 && vehicle.Position.X <= pos.X + 2) && (vehicle.Position.Y >= pos.Y - 2 && vehicle.Position.Y <= pos.Y + 2))
                {
                    isInVector = true;
                }
            }

            return isInVector;
        }

        public static void closeAllDoors(this Vehicle vehicle)
        {
            DbVehicle vehicleData = getData(vehicle);

            if(vehicleData != null)
            {
                for (int i = 0; i < vehicleData.vehicle_doors.Length; i++)
                {
                    vehicleData.vehicle_doors[i] = false;
                }

                vehicle.saveVehicleData(vehicleData);
            }
        }

        public static void closeAllWindows(this Vehicle vehicle)
        {
            DbVehicle vehicleData = getData(vehicle);

            if(vehicleData  != null)
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
            DbVehicle vehicleData = getData(vehicle);

            if(vehicleData != null)
            {
                vehicleData.dirt_level = number;

                vehicle.setVehicleData(vehicleData, false, true);
            }
        }

        public static DbVehicle getData(this Vehicle vehicle)
        {
            return vehicle.GetData<DbVehicle>(VehicleSystem._vehicleSharedDataIdentifier);
        }

        public static void toggleLock(this Vehicle vehicle, bool toggle)
        {
            DbVehicle vehicleData = vehicle.getData();

            if(vehicleData != null)
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

    }
}
