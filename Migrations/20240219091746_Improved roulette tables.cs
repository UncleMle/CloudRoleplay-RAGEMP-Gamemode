using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Improvedroulettetables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "table_heading",
                table: "roulette_tables");

            migrationBuilder.DropColumn(
                name: "table_name",
                table: "roulette_tables");

            migrationBuilder.AddColumn<float>(
                name: "heading",
                table: "roulette_tables",
                nullable: false,
                defaultValue: 0f);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "heading",
                table: "roulette_tables");

            migrationBuilder.AddColumn<float>(
                name: "table_heading",
                table: "roulette_tables",
                type: "float",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<string>(
                name: "table_name",
                table: "roulette_tables",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                defaultValue: "");
        }
    }
}
