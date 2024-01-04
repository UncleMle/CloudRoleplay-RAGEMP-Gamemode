using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.SpeedCameras
{
    public class SpeedCameras : Script
    {
        public string _speedCameraDataIdentifier = "speedCameraColshapeData";
        public List<SpeedCamera> cameras = new List<SpeedCamera>
        {
            new SpeedCamera
            {
                position = new Vector3(429.7, -543.6, 28.7),
                camPropPos = new Vector3(399.9, -561.0, 27.1),
                camFlashPos = new Vector3(400.1, -560.8, 32.7),
                camRot = 155,
                range = 25,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-2006.4, -388.6, 11.4),
                camPropPos = new Vector3(-2007.4, -395.9, 9.9),
                camFlashPos = new Vector3(-2007.3, -395.0, 14.4),
                camRot = 180,
                range = 10,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-76.7, 259.1, 101.4),
                camPropPos = new Vector3(-74.8, 272.1, 99.9),
                camFlashPos = new Vector3(-75.0, 271.8, 103.9),
                camRot = 100,
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(616.7, 42.3, 89.8),
                camPropPos = new Vector3(630.7, 57.3, 87.7),
                camFlashPos = new Vector3(631.0, 57.3, 92.4),
                camRot = 30,
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(170.8, -818.6, 31.2),
                camPropPos = new Vector3(142.7, -823, 29.9),
                camFlashPos = new Vector3(142.7, -823.8, 35.2),
                camRot = 180,
                range = 25,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(399.7, -989.6, 29.5),
                camPropPos = new Vector3(391.5, -1003.7, 27.8),
                camFlashPos = new Vector3(391.5, -1003.7, 32.6),
                camRot = 170,
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-1032.5, 263.4, 64.8),
                camPropPos = new Vector3(-1042.7, 279.5, 62.5),
                camFlashPos = new Vector3(-1042.7, 279.5, 66.9),
                camRot = 50,
                range = 25,
                speedLimit = 80,
            }
        };

        List<SpeedFine> speedFines = new List<SpeedFine>
        {
            new SpeedFine
            {
                finePrice = 400,
                speed = 82
            },
            new SpeedFine
            {
                finePrice = 800,
                speed = 120
            },
            new SpeedFine
            {
                finePrice = 2500,
                speed = 200
            },
        };

        public SpeedCameras()
        {
            cameras.ForEach(cam =>
            {
                NAPI.Object.CreateObject(NAPI.Util.GetHashKey("prop_cctv_pole_04"), cam.camPropPos, new Vector3(0, 0, cam.camRot));
                ColShape speedCamCol = NAPI.ColShape.CreateSphereColShape(cam.position, cam.range, 0);
                speedCamCol.SetData(_speedCameraDataIdentifier, cam);
            });
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setSpeedCamData(ColShape colshape, Player player)
        {
            SpeedCamera camData = colshape.GetData<SpeedCamera>(_speedCameraDataIdentifier);
        
            if(camData != null && player.IsInVehicle)
            {
                player.TriggerEvent("client:speedCameraTrigger");
                player.SetData(_speedCameraDataIdentifier, camData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeSpeedCamData(ColShape colshape, Player player)
        {
            SpeedCamera camData = colshape.GetData<SpeedCamera>(_speedCameraDataIdentifier);
            
            if(camData != null)
            {
                player.ResetData(_speedCameraDataIdentifier);
            }
        }

        [RemoteEvent("server:handleSpeedCamera")]
        public void handleSpeedCamera(Player player, int vehicleSpeed)
        {
            SpeedCamera cameraData = player.GetData<SpeedCamera>(_speedCameraDataIdentifier);
            DbCharacter characterData = player.getPlayerCharacterData();

            if(cameraData != null && characterData != null && player.IsInVehicle)
            {
                double speed = vehicleSpeed * 3.6;

                if(speed > speedFines[0].speed && speed > cameraData.speedLimit && player.VehicleSeat == 0)
                {
                    SpeedFine closest = speedFines.OrderBy(item => Math.Abs(speed - item.speed)).First();

                    if(closest != null)
                    {
                        NAPI.Pools.GetAllPlayers().ForEach(p =>
                        {
                            if(Vector3.Distance(p.Position, player.Position) < 120)
                            {
                                p.TriggerEvent("client:handleCameraFlash", player.Vehicle.Id, cameraData.camFlashPos.X, cameraData.camFlashPos.Y, cameraData.camFlashPos.Z);
                            }
                        });

                        characterData.money_amount -= closest.finePrice;

                        player.setPlayerCharacterData(characterData, false, true);
                        
                        player.SendChatMessage(ChatUtils.info + $"You have been fined in excess of {closest.finePrice.ToString("C")} for speeding ({speed.ToString("N0")}KMH in a {cameraData.speedLimit}KMH Zone). " +
                            $"Please go to a police station and pay your fine or it will end in further legal action being taken.");
                    }
                }
            }

        }

    }
}
