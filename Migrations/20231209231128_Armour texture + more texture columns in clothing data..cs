using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Armourtexturemoretexturecolumnsinclothingdata : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "armor_texture",
                table: "character_clothes",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "torso_texture",
                table: "character_clothes",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "armor_texture",
                table: "character_clothes");

            migrationBuilder.DropColumn(
                name: "torso_texture",
                table: "character_clothes");
        }
    }
}
