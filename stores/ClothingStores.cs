﻿using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.ClothingStores
{
    class ClothingStores : Script
    {
        public static List<ClothingStore> clothingStores = new List<ClothingStore>();
        public static string _clothingStoreIdentifier = "clothingStoreData";

        [ServerEvent(Event.ResourceStart)]
        public void clothingStarted()
        {
            clothingStores.Add(new ClothingStore { 
                displayName = "Binco Clothing", 
                name = "Binco LSPD", 
                position = new Vector3(425.5, -806.3, 29.5)
            });
            
            clothingStores.Add(new ClothingStore { 
                displayName = "Discount Clothing", 
                name = "Discount Strawberry", 
                position = new Vector3(75.5, -1392.8, 29.4)
            });

            for (int i = 0; i < clothingStores.Count; i++)
            {
                clothingStores[i].id = i;
                ColShape clothingColShape = NAPI.ColShape.CreateCylinderColShape(clothingStores[i].position, 1.0f, 1.0f);
                NAPI.TextLabel.CreateTextLabel($"{clothingStores[i].displayName} ~y~Y~w~ to interact", clothingStores[i].position, 20f, 1.0f, 4, new Color(255, 255, 255, 255), true);
                setColShapeData(clothingColShape, clothingStores[i]);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void enterClothingColShape(ColShape colshape, Player player)
        {
            ClothingStore clothingStoreData = colshape.GetData<ClothingStore>(_clothingStoreIdentifier);

            if(clothingStoreData != null)
            {
                setClothingStoreData(player, clothingStoreData);
                uiHandling.sendPushNotif(player, "To interact with this clothing store use Y.", 5500, false, false);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void onExitClothingColShape(ColShape colShape, Player player)
        {
            if(colShape.GetData<ClothingStore>(_clothingStoreIdentifier) != null)
            {
                flushClothingStoreData(player);

                DbCharacter charData = PlayersData.getPlayerCharacterData(player);
                if(charData != null)
                {
                    PlayersData.setCharacterClothes(player, charData.characterClothing);
                }
            }
        }

        [RemoteEvent("server:handleClothesPurchase")]
        public void clothesPurchase(Player player, string clothes)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            CharacterClothing clothingData = JsonConvert.DeserializeObject<CharacterClothing>(clothes);

            NAPI.Task.Run(() =>
            {
                uiHandling.setLoadingState(player, false);
            }, 5500);

            if (characterData != null && clothingData != null)
            {
                if(clothingData.Equals(characterData.characterClothing))
                {
                    uiHandling.sendPushNotifError(player, "You haven't purchased anything.", 6600);
                    return;
                }

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    CharacterClothing findCharClothes = dbContext.character_clothes
                        .Where(charFindClothes => charFindClothes.character_id == characterData.character_id)
                        .FirstOrDefault();

                    if(findCharClothes != null)
                    {
                        characterData.characterClothing = clothingData;
                        
                        dbContext.character_clothes.Remove(findCharClothes);
                        dbContext.SaveChanges();

                        clothingData.character_id = characterData.character_id;
                        dbContext.character_clothes.Add(clothingData);
                        dbContext.SaveChanges();

                        PlayersData.setPlayerCharacterData(player, characterData);

                        uiHandling.sendPushNotif(player, "You successfully purchase a new item of clothing.", 6600, false, false);
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
            player.SetData(_clothingStoreIdentifier, store);
            player.SetSharedData(_clothingStoreIdentifier, store);
        }

        public static void setColShapeData(ColShape colShape, ClothingStore store)
        {
            colShape.SetData(_clothingStoreIdentifier, store);
            colShape.SetSharedData(_clothingStoreIdentifier, store);
        }

    }
}
