using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Beganworkonhousingsystem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "houses",
                columns: table => new
                {
                    house_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    house_owner_id = table.Column<int>(nullable: false),
                    house_name = table.Column<string>(nullable: true),
                    house_position_x = table.Column<float>(nullable: false),
                    house_position_y = table.Column<float>(nullable: false),
                    house_position_z = table.Column<float>(nullable: false),
                    house_interior = table.Column<string>(nullable: true),
                    house_price = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_houses", x => x.house_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "houses");
        }
    }
}
