using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CloudRP.GeneralCommands
{
    public class FloatingDo : BaseEntity
    {
        [NotMapped]
        public string _floatingDoDataIdentifier = "floatingDoData";

        [Key]
        public int float_do_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public string text { get; set; }

        public void add(int ownerId, string text)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.Add(new FloatingDo
                {
                    CreatedDate = DateTime.Now,
                    owner_id = ownerId,
                    text = text
                });
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
