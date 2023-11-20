using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class U : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<uint>(
                name: "vehicle_spawn_hash",
                table: "vehicles",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "vehicle_spawn_hash",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(uint));
        }
    }
}
