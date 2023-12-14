using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class interiors : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "house_interior",
                table: "houses");

            migrationBuilder.AddColumn<int>(
                name: "house_interior_id",
                table: "houses",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "house_interior_id",
                table: "houses");

            migrationBuilder.AddColumn<string>(
                name: "house_interior",
                table: "houses",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true);
        }
    }
}
