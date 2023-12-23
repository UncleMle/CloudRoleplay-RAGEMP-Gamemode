using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
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
                name = "",
                position = new Vector3(431.9, -548.4, 28.8),
                range = 6,
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
                        player.TriggerEvent("client:speedCameraSound");
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
