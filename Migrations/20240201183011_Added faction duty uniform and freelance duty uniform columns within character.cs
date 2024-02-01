using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedfactiondutyuniformandfreelancedutyuniformcolumnswithincharacter : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "faction_duty_uniform",
                table: "characters",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "freelance_job_uniform",
                table: "characters",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "faction_duty_uniform",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "freelance_job_uniform",
                table: "characters");
        }
    }
}
