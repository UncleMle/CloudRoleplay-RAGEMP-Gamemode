using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.AttachmentSync
{
    public class AttachmentSync : Script
    {
        private static readonly string _attachmentDataKey = "attachmentSync:dataKey";

        public static void addAttachmentForPlayer(Player player, string bone, string model, Vector3 offset, Vector3 rotation)
        {
            AttachmentData attachmentData = new AttachmentData
            {
                bone = bone,
                modelName = model,
                offset = offset,
                rotation = rotation
            };

            player.SetCustomData(_attachmentDataKey, attachmentData);
            player.SetCustomSharedData(_attachmentDataKey, attachmentData);
        }

        public static void removePlayerAttachments(Player player)
        {
            if(player.GetData<AttachmentData>(_attachmentDataKey) != null)
            {
                player.ResetData(_attachmentDataKey);
                player.ResetSharedData(_attachmentDataKey);
            }
        }

    }
}
