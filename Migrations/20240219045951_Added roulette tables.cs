using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedroulettetables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "roulette_tables",
                columns: table => new
                {
                    roulette_table_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    table_name = table.Column<string>(nullable: false),
                    table_heading = table.Column<float>(nullable: false),
                    pos_x = table.Column<float>(nullable: false),
                    pos_y = table.Column<float>(nullable: false),
                    pos_z = table.Column<float>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roulette_tables", x => x.roulette_table_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "roulette_tables");
        }
    }
}
