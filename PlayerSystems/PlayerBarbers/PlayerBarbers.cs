using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerBarbers;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace CloudRP.PlayerSystems.PlayerBarber
{
    public class PlayerBarbers : Script
    {
        public static readonly int barberPrice = 120;
        public List<Vector3> barberShops = new List<Vector3>
        {
            new Vector3(-1283.0, -1117.1, 7.0),
            new Vector3(-815.1, -184.7, 37.6),
            new Vector3(136.7, -1708.4, 29.3),
            new Vector3(1931.6, 3730.0, 32.8),
            new Vector3(1212.2, -472.7, 66.2),
            new Vector3(-32.8, -152.3, 57.1),
            new Vector3(-278.3, 6228.1, 31.7)
        };

        public PlayerBarbers()
        {
            
            barberShops.ForEach(shop =>
            {
                RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                {
                    menuTitle = "Barber Shop",
                    raycastMenuItems = new List<string> { "Open barber menu" },
                    raycastMenuPosition = shop,
                    targetMethod = openBarberShop
                });
                
                NAPI.Blip.CreateBlip(71, shop, 1f, 4, "Barber Shop", 255, 1f, true, 0, 0);
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {barberShops.Count} barbershops were loaded.");
        }

        #region Global Methods
        public bool isInBarberShop(Player player)
            => barberShops.Where(shop => player.checkIsWithinCoord(shop, 2f))
            .FirstOrDefault() == null ? false : true;


        public void openBarberShop(Player player, string rayOption)
        {
            if (!isInBarberShop(player)) return;

            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            CharacterModel model = character.characterModel;

            uiHandling.handleObjectUiMutation(player, MutationKeys.Barber, new BarberUiData
            {
                chestHairStyle = model.chestHairStyle,
                eyebrowsColour = model.eyebrowsColour,
                eyebrowsStyle = model.eyebrowsStyle,
                facialHairColour = model.facialHairColour,
                facialHairStyle = model.facialHairStyle,
                hairColour = model.hairColour,
                hairHighlights = model.hairHighlights,
                hairStyle = model.hairStyle
            });

            uiHandling.pushRouterToClient(player, Browsers.BarberShop, true);
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:barbers:handlePurchase")]
        public void handleBarberPurchase(Player player, string data)
        {
            DbCharacter character = player.getPlayerCharacterData();
            BarberUiData dataFromUi = JsonConvert.DeserializeObject<BarberUiData>(data);

            if(character == null || dataFromUi == null) return;

            long difference = barberPrice - character.money_amount;

            if((character.money_amount - barberPrice) < 0)
            {
                uiHandling.sendPushNotifError(player, $"You don't have enough to pay for this. You need ${difference.ToString("N0")} more.", 6600, true);
                return;
            }

            character.money_amount -= barberPrice;
            player.setPlayerCharacterData(character, false, true);

            CharacterModel model = character.characterModel;

            model.hairStyle = dataFromUi.hairStyle;
            model.chestHairStyle = dataFromUi.chestHairStyle;
            model.eyebrowsColour = dataFromUi.eyebrowsColour;
            model.eyebrowsStyle = dataFromUi.eyebrowsStyle;
            model.facialHairColour = dataFromUi.facialHairColour;
            model.facialHairStyle = dataFromUi.facialHairStyle;
            model.hairColour = dataFromUi.hairColour;
            model.hairHighlights = dataFromUi.hairHighlights;

            player.setCharacterModel(model, true);
            uiHandling.setLoadingState(player, false);

            CommandUtils.successSay(player, $"You succesfully brought a new look. You have been charged {ChatUtils.moneyGreen}${barberPrice.ToString("N0")}");
            uiHandling.resetRouter(player);
        }
        #endregion

    }
}
