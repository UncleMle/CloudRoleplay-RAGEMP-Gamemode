using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedpositiononvehicletable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "position_x",
                table: "vehicles",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "position_y",
                table: "vehicles",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "position_z",
                table: "vehicles",
                nullable: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "position_x",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "position_y",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "position_z",
                table: "vehicles");
        }
    }
}
