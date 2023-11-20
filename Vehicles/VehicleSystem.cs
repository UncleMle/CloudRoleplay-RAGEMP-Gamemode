using CloudRP.Authentication;
using CloudRP.Database;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Timers;

namespace CloudRP.Vehicles
{
    internal class VehicleSystem : Script
    {
        public static List<DbVehicle> vehicles;
        public static string _vehicleSharedDataIdentifier = "VehicleData";
        private static int _timerInterval = 5000;
        private static Timer saveVehicleTimer;
        

        [ServerEvent(Event.ResourceStart)]
        public void spawnAllVehicles()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                vehicles = dbContext.vehicles.ToList();
            }

            Console.WriteLine($"A total of {vehicles.Count} vehicles where loaded in.");

            if (vehicles.Count > 0)
            {

                foreach (var item in vehicles)
                {
                    spawnVehicle(item);
                }
            };

            beginSaveInterval();
        }

        void beginSaveInterval()
        {
            NAPI.Task.Run(() =>
            {
                saveVehicleTimer = new Timer();
                saveVehicleTimer.Interval = _timerInterval;
                saveVehicleTimer.Elapsed += saveVehiclePositions;

                saveVehicleTimer.AutoReset = true;
                saveVehicleTimer.Enabled = true;
            });
        }
        
        public static Vehicle spawnVehicle(DbVehicle vehicle)
        {
            Vector3 spawnPosition = new Vector3(vehicle.position_x, vehicle.position_y, vehicle.position_z);
            float rotation = vehicle.rotation;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicle.vehicle_spawn_hash, spawnPosition, rotation, 255, 255, vehicle.numberplate, 255, false, true, 0);

            veh.SetSharedData(_vehicleSharedDataIdentifier, vehicle);
            veh.SetData(_vehicleSharedDataIdentifier, vehicle);

            return veh;
        }

        public static void saveVehiclePositions(object source, ElapsedEventArgs e)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();

            foreach (var vehicle in allVehicles)
            {
                try
                {
                    saveVehiclePosition(vehicle);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }

        public static void saveVehiclePosition(Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);
            if (vehicleData == null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVehicle = dbContext.vehicles.Find(vehicleData.vehicle_id);

                if (findVehicle == null) return;

                findVehicle.position_x = vehicle.Position.X;
                findVehicle.position_y = vehicle.Position.Y;
                findVehicle.position_z = vehicle.Position.Z;

                Console.WriteLine($"Updated vehicle position for vehicle {findVehicle.vehicle_id}");

                dbContext.SaveChanges();
            }

        }

        public static void bringVehicleToPlayer(Player player, Vehicle vehicle, bool putInVehicle)
        {
            vehicle.Position = player.Position;
            
            if(putInVehicle)
            {
                player.SetIntoVehicle(vehicle, 0);
            }

            saveVehiclePosition(vehicle);
        }

        public static Vehicle findVehicleById(int vehicleId)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();
            Vehicle foundVehicle = null;

            foreach (var vehicle in allVehicles)
            {
                DbVehicle vehicleData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);

                if(vehicleData.vehicle_id == vehicleId)
                {
                    foundVehicle = vehicle;
                }
            }

            return foundVehicle;
        }
    }
}
