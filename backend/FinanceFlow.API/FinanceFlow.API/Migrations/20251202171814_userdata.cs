using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class userdata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Fizetes = table.Column<int>(type: "int", nullable: false),
                    Auto = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    BenzinKolt = table.Column<int>(type: "int", nullable: false),
                    Lakas = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    LakasKolt = table.Column<int>(type: "int", nullable: false),
                    Szamlak = table.Column<int>(type: "int", nullable: false),
                    Egyeb = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserData", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserData");
        }
    }
}
