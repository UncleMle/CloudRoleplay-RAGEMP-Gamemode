using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.InventorySystem
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
            }
        };
    }
}
