using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ClothingStores
{
    class ClothingStores : Script
    {
        public static List<ClothingStore> clothingStores = new List<ClothingStore>();

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
                NAPI.TextLabel.CreateTextLabel($"{clothingStores[i].displayName} #{i}", clothingStores[i].position, 2, 1, 4, new Color(255, 255, 255, 255), false, 0);
            }

        }


    }
}
