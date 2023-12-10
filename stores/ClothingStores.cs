using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
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
                ColShape clothingColShape = NAPI.ColShape.CreateCylinderColShape(clothingStores[i].position, 1.0f, 1.0f);
                NAPI.TextLabel.CreateTextLabel($"{clothingStores[i].displayName} ~y~Y~w~ to interact #{i}", clothingStores[i].position, 20f, 1.0f, 4, new Color(255, 255, 255, 255), true);
                clothingColShape.SetData(_clothingStoreIdentifier, clothingStores[i]);
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


    }
}
