using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace CloudRP.ServerSystems.Admin
{
    public class AdminMarker : Script
    {
        public static string _adminMarkerDataIdentifier = "adminMarkerLabel";

        public AdminMarker()
        {
            Main.resourceStart += loadMarkers;
        }

        [Key]
        public int admin_marker_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public string text { get; set; }
        public float pos_x { get; set; }
        public float pos_y { get; set; }
        public float pos_z { get; set; }

        private static void loadMarkers()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                foreach (AdminMarker item in dbContext.admin_markers)
                {
                    item.init();
                }
            }
        }

        public static AdminMarker add(string text, Vector3 pos, int ownerId)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                AdminMarker marker = new AdminMarker
                {
                    owner_id = ownerId,
                    pos_x = pos.X,
                    pos_y = pos.Y,
                    pos_z = pos.Z,
                    text = text
                };

                dbContext.admin_markers.Add(marker);
                dbContext.SaveChanges();

                marker.init();
                return marker;
            }
        }

        public void delete()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.admin_markers.Remove(this);
                dbContext.SaveChanges();
            }

            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                AdminMarker labelData = label.GetData<AdminMarker>(_adminMarkerDataIdentifier);

                if (labelData != null && labelData.Equals(this))
                {
                    label.Delete();
                }
            });
        }

        public static int getAllByAccount(int characterId)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                return dbContext.admin_markers
                    .Where(marker => marker.owner_id == characterId)
                    .ToList()
                    .Count;
            }
        }

        public static bool deleteById(int markerId)
        {
            bool wasDeleted = false;

            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                AdminMarker labelData = label.GetData<AdminMarker>(_adminMarkerDataIdentifier);

                if (labelData != null && labelData.admin_marker_id == markerId)
                {
                    labelData.delete();
                    label.Delete();
                    wasDeleted = true;
                }
            });

            return wasDeleted;
        }

        public static void deleteAllByAccount(int accountId)
        {
            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                AdminMarker labelData = label.GetData<AdminMarker>(_adminMarkerDataIdentifier);

                if (labelData != null && labelData.owner_id == accountId)
                {
                    labelData.delete();
                    label.Delete();
                }
            });
        }

        public void init()
        {
            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                AdminMarker labelData = label.GetData<AdminMarker>(_adminMarkerDataIdentifier);

                if (labelData != null && labelData.admin_marker_id == admin_marker_id)
                {
                    label.Delete();
                }
            });

            string targetText = $"Admin Marker #{admin_marker_id}\n~r~((~w~ {text} ~r~))";

            TextLabel newLabel = NAPI.TextLabel.CreateTextLabel(targetText, new Vector3(pos_x, pos_y, pos_z), 25f, 2.0f, 4, new Color(255, 0, 0, 255), false);

            newLabel.SetData(_adminMarkerDataIdentifier, this);
        }
    }
}
