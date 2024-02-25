using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.InventorySystem
{
    public class InventorySystem : Script
    {
        public InventorySystem()
        {
            Main.resourceStart += () => ChatUtils.startupPrint($"Loaded in {Items.inventoryItems.Count} inventory items.");
        }

        [RemoteEvent("server:inventory:resyncItems")]
        public void resyncInventory(Player player)
        {
            InventoryItem.resyncInventoryItems(player);
        }

        [Command("giveitem", "~r~/giveitem [nameOrId] [itemId]")]
        public void giveInventoryItem(Player player, string nameOrId, int itemId)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer != null)
                {
                    DbCharacter findPlayerCharacterData = findPlayer.getPlayerCharacterData();
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
                }
                else
                {
                    CommandUtils.errorSay(player, "Player wasn't found.");
                }


            }
            else AdminUtils.sendNoAuth(player);
        }

    }
}
