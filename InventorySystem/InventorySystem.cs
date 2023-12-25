using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.InventorySystem
{
    public class InventorySystem : Script
    {
        [RemoteEvent("server:inventory:resyncItems")]
        public void resyncInventory(Player player)
        {
            InventoryItem.resyncInventoryItems(player);
        }

        [Command("giveitem", "~r~/giveitem [nameOrId] [itemId]")]
        public void giveInventoryItem(Player player, string nameOrId, int itemId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if(findPlayer != null)
                {
                    DbCharacter findPlayerCharacterData = PlayersData.getPlayerCharacterData(findPlayer);
                    if (findPlayerCharacterData == null) return;

                    InventoryItem newItem = InventoryItem.addItemForPlayer(findPlayer, itemId);

                    if (newItem != null)
                    {
                        AdminUtils.staffSay(player, $"You gave {findPlayerCharacterData.character_name} item with id #{newItem.item_id}");
                    }
                    else
                    {
                        CommandUtils.errorSay(player, $"Enter a valid item ID between 0 and {Items.inventoryItems.Count - 1}");
                    }
                } else
                {
                    CommandUtils.errorSay(player, "Player wasn't found.");
                }


            } else AdminUtils.sendNoAuth(player);
        }

    }
}
