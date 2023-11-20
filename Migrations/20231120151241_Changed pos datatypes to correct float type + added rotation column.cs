using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Changedposdatatypestocorrectfloattypeaddedrotationcolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "position_z",
                table: "vehicles",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");

            migrationBuilder.AlterColumn<float>(
                name: "position_y",
                table: "vehicles",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");

            migrationBuilder.AlterColumn<float>(
                name: "position_x",
                table: "vehicles",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");

            migrationBuilder.AddColumn<float>(
                name: "rotation",
                table: "vehicles",
                nullable: false,
                defaultValue: 0f);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rotation",
                table: "vehicles");

            migrationBuilder.AlterColumn<string>(
                name: "position_z",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(float));

            migrationBuilder.AlterColumn<string>(
                name: "position_y",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(float));

            migrationBuilder.AlterColumn<string>(
                name: "position_x",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(float));
        }
    }
}
