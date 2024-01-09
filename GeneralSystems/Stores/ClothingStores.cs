using CloudRP.PlayerSystems.ChatSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CloudRP.ServerSystems.Utils;

namespace CloudRP.GeneralSystems.Stores
{
    class ClothingStores : Script
    {
        public static List<ClothingStore> clothingStores = new List<ClothingStore>();
        public static string _clothingStoreIdentifier = "clothingStoreData";

        [ServerEvent(Event.ResourceStart)]
        public void clothingStarted()
        {
            clothingStores.Add(new ClothingStore
            {
                displayName = "Binco Clothing",
                name = "Binco LSPD",
                position = new Vector3(425.5, -806.3, 29.5)
            });

            clothingStores.Add(new ClothingStore
            {
                displayName = "Discount Clothing",
                name = "Discount Strawberry",
                position = new Vector3(75.5, -1392.8, 29.4)
            });

            clothingStores.Add(new ClothingStore
            {
                displayName = "Discount Clothing",
                name = "Discount Paleto",
                position = new Vector3(4.6, 6512.3, 31.9)
            });

            clothingStores.Add(new ClothingStore
            {
                displayName = "Ponsonbys Clothing",
                name = "Ponsonbys Rockford Plaza",
                position = new Vector3(-163.4, -302.8, 39.7)
            });

            clothingStores.Add(new ClothingStore
            {
                displayName = "Surburban Clothing",
                name = "Surburban Hawick Ave",
                position = new Vector3(125.4, -224.7, 54.6)
            });

            clothingStores.Add(new ClothingStore
            {
                displayName = "Discount Clothing",
                name = "Discount Grapeseed",
                position = new Vector3(1693.9, 4822.6, 42.1)
            });

            for (int i = 0; i < clothingStores.Count; i++)
            {
                clothingStores[i].id = i;
                Vector3 pos = clothingStores[i].position;
                string name = clothingStores[i].name;
                string dispName = clothingStores[i].displayName;

                ColShape clothingColShape = NAPI.ColShape.CreateCylinderColShape(pos, 1.0f, 1.0f);
                NAPI.TextLabel.CreateTextLabel($"{dispName} ~y~Y~w~ to interact", pos, 10f, 1.0f, 4, new Color(255, 255, 255, 255), true);

                NAPI.Blip.CreateBlip(73, pos, 1.0f, 63, name, 255, 1.0f, true, 0, 0);
                NAPI.Marker.CreateMarker(27, new Vector3(pos.X, pos.Y, pos.Z - 1), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);

                setColShapeData(clothingColShape, clothingStores[i]);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void enterClothingColShape(ColShape colshape, Player player)
        {
            ClothingStore clothingStoreData = colshape.GetData<ClothingStore>(_clothingStoreIdentifier);

            if (clothingStoreData != null)
            {
                setClothingStoreData(player, clothingStoreData);
                uiHandling.sendPushNotif(player, "To interact with this clothing store use Y.", 5500, false, false);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void onExitClothingColShape(ColShape colShape, Player player)
        {
            if (colShape.GetData<ClothingStore>(_clothingStoreIdentifier) != null)
            {
                flushClothingStoreData(player);

                DbCharacter charData = player.getPlayerCharacterData();
                if (charData != null)
                {
                    player.setCharacterClothes(charData.characterClothing);
                }
            }
        }

        [RemoteEvent("server:handleClothesPurchase")]
        public void clothesPurchase(Player player, string clothes)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            CharacterClothing clothingData = JsonConvert.DeserializeObject<CharacterClothing>(clothes);

            NAPI.Task.Run(() =>
            {
                uiHandling.setLoadingState(player, false);
            }, 1500);

            if (characterData != null && clothingData != null)
            {
                if (characterData.characterClothing.Equals(clothingData))
                {
                    uiHandling.sendPushNotifError(player, "You haven't purchased anything.", 6600);
                    return;
                }

                if (characterData.money_amount - 300 <= 0)
                {
                    uiHandling.sendPushNotifError(player, "You do not have enough money to cover this purchase.", 5500, true);
                    return;
                }

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    CharacterClothing findCharClothes = dbContext.character_clothes
                        .Where(charFindClothes => charFindClothes.character_id == characterData.character_id)
                        .FirstOrDefault();

                    if (findCharClothes != null)
                    {
                        characterData.characterClothing = clothingData;

                        dbContext.character_clothes.Remove(findCharClothes);
                        dbContext.SaveChanges();

                        clothingData.character_id = characterData.character_id;
                        dbContext.character_clothes.Add(clothingData);
                        dbContext.SaveChanges();
                        uiHandling.sendPushNotif(player, "You successfully purchase a new item of clothing.", 6600, false, false);

                        characterData.money_amount -= 300;

                        player.setPlayerCharacterData(characterData, true, true);
                        CommandUtils.successSay(player, $"You purchased a new clothing item for {ChatUtils.moneyGreen}$300");
                    }
                }
            }
        }

        public static void flushClothingStoreData(Player player)
        {
            player.ResetData(_clothingStoreIdentifier);
            player.ResetSharedData(_clothingStoreIdentifier);
        }

        public static void setClothingStoreData(Player player, ClothingStore store)
        {
            player.SetCustomData(_clothingStoreIdentifier, store);
            player.SetCustomSharedData(_clothingStoreIdentifier, store);
        }

        public static void setColShapeData(ColShape colShape, ClothingStore store)
        {
            colShape.SetData(_clothingStoreIdentifier, store);
            colShape.SetSharedData(_clothingStoreIdentifier, store);
        }

    }
}
