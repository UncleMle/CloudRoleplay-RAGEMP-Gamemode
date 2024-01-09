using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace CloudRP.GeneralSystems.InventorySystem
{
    public class InventoryItem : Script
    {
        [Key]
        public int item_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public string name { get; set; }
        public string displayName { get; set; }

        public static InventoryItem addItemForPlayer(Player player, int itemId)
        {
            InventoryItem added = null;

            Items.inventoryItems.ForEach(item =>
            {
                if (item.item_id == itemId)
                {
                    DbCharacter characterData = player.getPlayerCharacterData();

                    if (characterData != null)
                    {
                        using (DefaultDbContext dbContext = new DefaultDbContext())
                        {
                            InventoryItem newItem = new InventoryItem
                            {
                                owner_id = characterData.character_id,
                                name = item.name,
                                displayName = item.displayName
                            };

                            dbContext.inventory_items.Add(newItem);
                            dbContext.SaveChanges();

                            uiHandling.resetMutationPusher(player, MutationKeys.Inventory);

                            getAllInventoryItems(player).ForEach(item =>
                            {
                                uiHandling.handleObjectUiMutation(player, MutationKeys.Inventory, item);
                            });

                            added = newItem;
                        }
                    }
                }
            });

            return added;
        }

        public void deleteItem()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.inventory_items.Remove(this);
            }
        }

        public static void resyncInventoryItems(Player target)
        {
            DbCharacter characterData = target.getPlayerCharacterData();

            if (characterData != null)
            {
                uiHandling.resetMutationPusher(target, MutationKeys.Inventory);

                getAllInventoryItems(target).ForEach(item =>
                {
                    uiHandling.handleObjectUiMutationPush(target, MutationKeys.Inventory, item);
                });
            }
        }

        public static List<InventoryItem> getAllInventoryItems(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            List<InventoryItem> inventoryItems = new List<InventoryItem>();

            if (characterData != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    inventoryItems = dbContext.inventory_items
                        .Where(item => item.owner_id == characterData.character_id)
                        .ToList();
                }
            }

            return inventoryItems;
        }
    }
}
