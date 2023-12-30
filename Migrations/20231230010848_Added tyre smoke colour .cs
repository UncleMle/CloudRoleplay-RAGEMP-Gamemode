using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedtyresmokecolour : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "tyre_smoke_b",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "tyre_smoke_g",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "tyre_smoke_r",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tyre_smoke_b",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "tyre_smoke_g",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "tyre_smoke_r",
                table: "vehicle_mods");
        }
    }
}
