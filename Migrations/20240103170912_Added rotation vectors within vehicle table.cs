using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedrotationvectorswithinvehicletable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "rotation_x",
                table: "vehicles",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "rotation_y",
                table: "vehicles",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "rotation_z",
                table: "vehicles",
                nullable: false,
                defaultValue: 0f);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rotation_x",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "rotation_y",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "rotation_z",
                table: "vehicles");
        }
    }
}
