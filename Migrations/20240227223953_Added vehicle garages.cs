using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedvehiclegarages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vehicle_garages",
                columns: table => new
                {
                    garage_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    garage_owner_id = table.Column<int>(nullable: false),
                    vehicle_slots = table.Column<int>(nullable: false),
                    pos_x = table.Column<float>(nullable: false),
                    pos_y = table.Column<float>(nullable: false),
                    pos_z = table.Column<float>(nullable: false),
                    garage_sell_price = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicle_garages", x => x.garage_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vehicle_garages");
        }
    }
}
