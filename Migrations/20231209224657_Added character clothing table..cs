using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedcharacterclothingtable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "character_clothes",
                columns: table => new
                {
                    clothing_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    character_id = table.Column<int>(nullable: false),
                    mask = table.Column<int>(nullable: false),
                    mask_texture = table.Column<int>(nullable: false),
                    torso = table.Column<int>(nullable: false),
                    leg = table.Column<int>(nullable: false),
                    leg_texture = table.Column<int>(nullable: false),
                    bags = table.Column<int>(nullable: false),
                    bag_texture = table.Column<int>(nullable: false),
                    shoes = table.Column<int>(nullable: false),
                    shoes_texture = table.Column<int>(nullable: false),
                    access = table.Column<int>(nullable: false),
                    access_texture = table.Column<int>(nullable: false),
                    undershirt = table.Column<int>(nullable: false),
                    undershirt_texture = table.Column<int>(nullable: false),
                    armor = table.Column<int>(nullable: false),
                    decals = table.Column<int>(nullable: false),
                    decals_texture = table.Column<int>(nullable: false),
                    top = table.Column<int>(nullable: false),
                    top_texture = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_clothes", x => x.clothing_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "character_clothes");
        }
    }
}
