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
                position = new Vector3(431.9, -548.4, 28.8),
                camPropPos = new Vector3(427.9, -564.7, 35.8),
                range = 10,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(425.8, -536.1, 28.7),
                camPropPos = new Vector3(427.9, -564.7, 35.8),
                range = 10,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-2006.4, -388.6, 11.4),
                camPropPos = new Vector3(-2012.1, -392.4, 17.3),
                range = 10,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-76.7, 259.1, 101.4),
                camPropPos = new Vector3(-87.6, 244.5, 107.2),
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(616.7, 42.3, 89.8),
                camPropPos = new Vector3(616.3, 75.2, 103.6),
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(170.8, -818.6, 31.2),
                camPropPos = new Vector3(157.6, -797.0, 39.1),
                range = 25,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(399.7, -989.6, 29.5),
                camPropPos = new Vector3(392.3, -1009.4, 37.8),
                range = 15,
                speedLimit = 80,
            },
            new SpeedCamera
            {
                position = new Vector3(-1032.5, 263.4, 64.8),
                camPropPos = new Vector3(-1033.8, 277.8, 72.7),
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
                NAPI.Object.CreateObject(NAPI.Util.GetHashKey("prop_cctv_cam_04a"), cam.camPropPos, new Vector3(0, 0, 0));
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
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(cameraData != null && characterData != null && player.IsInVehicle)
            {
                double speed = vehicleSpeed * 3.6;

                if(speed > speedFines[0].speed && speed > cameraData.speedLimit)
                {
                    SpeedFine closest = speedFines.OrderBy(item => Math.Abs(speed - item.speed)).First();

                    if(closest != null)
                    {
                        List<Player> closePlayers = NAPI.Player.GetPlayersInRadiusOfPlayer(40f, player);

                        closePlayers.ForEach(p =>
                        {
                            p.TriggerEvent("client:handleCameraFlash", player.Vehicle.Id, cameraData.camPropPos.X, cameraData.camPropPos.Y, cameraData.camPropPos.Z);
                        });

                        characterData.money_amount -= closest.finePrice;
                        PlayersData.setPlayerCharacterData(player, characterData, false, true);
                        
                        player.SendChatMessage(ChatUtils.info + $"You have been fined in excess of {closest.finePrice.ToString("C")} for speeding ({speed.ToString("N0")}KMH in a {cameraData.speedLimit}KMH Zone). " +
                            $"Please go to a police station and pay your fine or it will end in further legal action being taken.");
                    }
                }
            }

        }

    }
}
