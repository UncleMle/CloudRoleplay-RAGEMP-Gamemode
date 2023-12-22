using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedneoncolumnsforvehiclemods : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "neon_colour_b",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "neon_colour_g",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "neon_colour_r",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "neon_enabled",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "neon_colour_b",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "neon_colour_g",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "neon_colour_r",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "neon_enabled",
                table: "vehicle_mods");
        }
    }
}
