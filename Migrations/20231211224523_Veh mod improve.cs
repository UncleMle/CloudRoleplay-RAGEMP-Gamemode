using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Vehmodimprove : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "pearleascent",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "wheel_colour",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "pearleascent",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "wheel_colour",
                table: "vehicle_mods");
        }
    }
}
