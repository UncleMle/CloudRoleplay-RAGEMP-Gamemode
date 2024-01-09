using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.InventorySystem
{
    public class Items
    {
        public static List<InventoryItem> inventoryItems = new List<InventoryItem>
        {
            new InventoryItem
            {
                displayName = "Assault Rifle",
                item_id = 0,
                name = "assaultrifle",
            },
            new InventoryItem
            {
                displayName = "Water Bottle",
                item_id = 1,
                name = "water",
            },
            new InventoryItem
            {
                displayName = "Burger",
                item_id = 1,
                name = "burger",
            },
        };
    }
}
