using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Vehicles
{
    public class VehicleModSystem : Script
    {
        public static string _colShapeIdentifer = "customsAreaColshapeData";
        public static List<CustomArea> customsAreas = new List<CustomArea>
        {
            new CustomArea
            {
                custom_id = 0,
                startVec = new Vector3(-416.6, -77.0, 48.1),
                endVec = new Vector3(-350.8, -189.6, 43.1),
                name = "Los Santos Customs"
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void addColShapes()
        {
            foreach(CustomArea col in customsAreas)
            {
                Vector3 blipPoint = (col.startVec + col.endVec) * 0;

                ColShape colshape = NAPI.ColShape.Create3DColShape(col.startVec, col.endVec, 0);
                NAPI.Blip.CreateBlip(544, blipPoint, 1.0f, 63, col.name, 255, 1.0f, true, 0, 0);

                setColData(colshape, col);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void enterColShape(Player player, ColShape colShape)
        {
            CustomArea colShapeData = colShape.GetData<CustomArea>(_colShapeIdentifer);

            if(colShapeData != null)
            {
                Console.WriteLine("Player entered customs colshape");

                setPlayerColData(player, colShapeData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void onExitColShape(Player player, ColShape colShape)
        {
            CustomArea colShapeData = colShape.GetData<CustomArea>(_colShapeIdentifer);

            if(colShapeData != null)
            {
                Console.WriteLine("Player exited customs colshape");

                flushPlayerColData(player);
            }
        }

        [Command("mods", "~y~Use: ~w~/mods")]
        public void modsCommand(Player player)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            User userData = PlayersData.getPlayerAccountData(player);

            if (characterData == null || userData == null || !player.IsInVehicle) return;

            Vehicle viewModsVehicle = player.Vehicle;
            DbVehicle vehicleData = VehicleSystem.getVehicleData(viewModsVehicle);

            if(vehicleData != null)
            {
                uiHandling.pushRouterToClient(player, Browsers.ModsView);
            }
        }

        public static void setColData(ColShape colshape, CustomArea customsData)
        {
            colshape.SetSharedData(_colShapeIdentifer, customsData);
            colshape.SetData(_colShapeIdentifer, customsData);
        }

        public static void setPlayerColData(Player player, CustomArea customAreaData)
        {
            player.SetData(_colShapeIdentifer, customAreaData);
            player.SetSharedData(_colShapeIdentifer, customAreaData);
        }
        
        public static void flushPlayerColData(Player player)
        {
            player.ResetData(_colShapeIdentifer);
            player.ResetSharedData(_colShapeIdentifer);
        }
    }
}
