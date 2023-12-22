using CloudRP.Character;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
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
                range = 6
            }
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
        
            if(camData != null)
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

            if(cameraData != null && characterData != null)
            {
                Console.WriteLine("Vehicle speed " + vehicleSpeed);
            }

        }

    }
}
