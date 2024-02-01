using CloudRP.PlayerSystems.Character;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection.Emit;
using System.Text;

namespace CloudRP.GeneralSystems.GeneralCommands
{
    public class FloatingDo : Script
    {
        public FloatingDo()
        {
            Main.resourceStart += loadFdos;
        }

        private static void loadFdos()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                foreach (FloatingDo item in dbContext.floating_dos)
                {
                    item.init();
                }
            }
        }

        [NotMapped]
        public static string _floatingDoDataIdentifier = "floatingDoData";

        [Key]
        public int float_do_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public float pos_x { get; set; }
        public float pos_y { get; set; }
        public float pos_z { get; set; }
        public string text { get; set; }

        public static FloatingDo add(int ownerId, string text, Vector3 position)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                FloatingDo floatingDo = new FloatingDo
                {
                    pos_x = position.X,
                    pos_z = position.Z,
                    pos_y = position.Y,
                    owner_id = ownerId,
                    text = text
                };

                dbContext.Add(floatingDo);
                dbContext.SaveChanges();

                floatingDo.init();
                return floatingDo;
            }
        }

        public void init()
        {
            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                FloatingDo fDoData = label.GetData<FloatingDo>(_floatingDoDataIdentifier);

                if (fDoData != null && fDoData.float_do_id == float_do_id)
                {
                    label.Delete();
                }
            });

            TextLabel fdoLabel = NAPI.TextLabel.CreateTextLabel($"Floating Do #{float_do_id} \n~p~(( ~w~" + text + " ~p~))", new Vector3(pos_x, pos_y, pos_z), 20f, 1.0f, 4, new Color(255, 255, 255, 180), false, 0);
            fdoLabel.SetData(_floatingDoDataIdentifier, this);
        }

        public static bool deleteById(int fdoId)
        {
            bool wasDeleted = false;

            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                FloatingDo labelData = label.GetData<FloatingDo>(_floatingDoDataIdentifier);

                if (labelData != null && labelData.float_do_id == fdoId)
                {
                    labelData.delete();
                    label.Delete();
                    wasDeleted = true;
                }
            });

            return wasDeleted;
        }

        public static int getAllByPlayer(DbCharacter character)
        {
            int count = 0;
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<FloatingDo> floatingDos = dbContext.floating_dos
                    .Where(fdo => fdo.owner_id == character.character_id)
                    .ToList();

                count = floatingDos.Count;
            }

            return count;
        }

        public static void deleteAllByCharacter(int characterId)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                foreach (FloatingDo item in dbContext.floating_dos)
                {
                    if (item.owner_id == characterId)
                    {
                        item.delete();
                    }
                }
            }
        }

        public static FloatingDo getById(int fDoId)
        {
            FloatingDo floatingDo;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                floatingDo = dbContext.floating_dos.Find(fDoId);
            }

            return floatingDo;
        }

        public void delete()
        {
            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                FloatingDo fDoData = label.GetData<FloatingDo>(_floatingDoDataIdentifier);

                if (fDoData != null && fDoData.float_do_id == float_do_id)
                {
                    label.Delete();
                }
            });

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.floating_dos.Remove(this);
                dbContext.SaveChanges();
            }
        }
    }
}
