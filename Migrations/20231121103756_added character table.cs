using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class addedcharactertable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "characters",
                columns: table => new
                {
                    character_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    owner_id = table.Column<int>(nullable: false),
                    character_name = table.Column<string>(nullable: false),
                    position_x = table.Column<float>(nullable: false),
                    position_y = table.Column<float>(nullable: false),
                    position_z = table.Column<float>(nullable: false),
                    last_login = table.Column<DateTime>(nullable: false),
                    character_health = table.Column<int>(nullable: false),
                    character_isbanned = table.Column<int>(nullable: false),
                    money_amount = table.Column<int>(nullable: false),
                    play_time_minutes = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_characters", x => x.character_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "characters");
        }
    }
}
