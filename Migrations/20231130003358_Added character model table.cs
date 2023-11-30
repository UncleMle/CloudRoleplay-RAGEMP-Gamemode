using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedcharactermodeltable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "character_models",
                columns: table => new
                {
                    character_model_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    owner_id = table.Column<int>(nullable: false),
                    rotation = table.Column<int>(nullable: false),
                    firstHeadShape = table.Column<int>(nullable: false),
                    secondHeadShape = table.Column<int>(nullable: false),
                    firstSkinTone = table.Column<int>(nullable: false),
                    secondSkinTone = table.Column<int>(nullable: false),
                    headMix = table.Column<int>(nullable: false),
                    skinMix = table.Column<int>(nullable: false),
                    sex = table.Column<bool>(nullable: false),
                    noseWidth = table.Column<int>(nullable: false),
                    noseLength = table.Column<int>(nullable: false),
                    noseTip = table.Column<int>(nullable: false),
                    browHeight = table.Column<int>(nullable: false),
                    cheekBoneHeight = table.Column<int>(nullable: false),
                    cheeksWidth = table.Column<int>(nullable: false),
                    lips = table.Column<int>(nullable: false),
                    lipstick = table.Column<int>(nullable: false),
                    jawHeight = table.Column<int>(nullable: false),
                    chinPosition = table.Column<int>(nullable: false),
                    ChinShape = table.Column<int>(nullable: false),
                    noseHeight = table.Column<int>(nullable: false),
                    noseBridge = table.Column<int>(nullable: false),
                    noseBridgeShift = table.Column<int>(nullable: false),
                    browWidth = table.Column<int>(nullable: false),
                    cheekBoneWidth = table.Column<int>(nullable: false),
                    eyes = table.Column<int>(nullable: false),
                    jawWidth = table.Column<int>(nullable: false),
                    chinLength = table.Column<int>(nullable: false),
                    chinWidth = table.Column<int>(nullable: false),
                    neckWidth = table.Column<int>(nullable: false),
                    eyeColour = table.Column<int>(nullable: false),
                    blemishes = table.Column<int>(nullable: false),
                    ageing = table.Column<int>(nullable: false),
                    facialHairStyle = table.Column<int>(nullable: false),
                    facialHairColour = table.Column<int>(nullable: false),
                    chestHairStyle = table.Column<int>(nullable: false),
                    hairStyle = table.Column<int>(nullable: false),
                    hairColour = table.Column<int>(nullable: false),
                    hairHighlights = table.Column<int>(nullable: false),
                    eyebrowsStyle = table.Column<int>(nullable: false),
                    eyebrowsColour = table.Column<int>(nullable: false),
                    complexion = table.Column<int>(nullable: false),
                    sunDamage = table.Column<int>(nullable: false),
                    molesFreckles = table.Column<int>(nullable: false),
                    blushStyle = table.Column<int>(nullable: false),
                    makeup = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_models", x => x.character_model_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "character_models");
        }
    }
}
