using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updatedbantablescolumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "issue_unix_data",
                table: "bans");

            migrationBuilder.AlterColumn<long>(
                name: "lift_unix_time",
                table: "bans",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<long>(
                name: "issue_unix_date",
                table: "bans",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "issue_unix_date",
                table: "bans");

            migrationBuilder.AlterColumn<int>(
                name: "lift_unix_time",
                table: "bans",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AddColumn<int>(
                name: "issue_unix_data",
                table: "bans",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
