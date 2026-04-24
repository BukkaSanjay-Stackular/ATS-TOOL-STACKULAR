using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ATStool.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeRoleNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE AspNetRoles
                SET Name = 'recruitment',
                    NormalizedName = 'RECRUITMENT'
                WHERE Name IN ('Recruiter', 'recruitment');

                UPDATE AspNetRoles
                SET Name = 'interviewer',
                    NormalizedName = 'INTERVIEWER'
                WHERE Name IN ('Interviewer', 'interviewer');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE AspNetRoles
                SET Name = 'Recruiter',
                    NormalizedName = 'RECRUITER'
                WHERE Name = 'recruitment';

                UPDATE AspNetRoles
                SET Name = 'Interviewer',
                    NormalizedName = 'INTERVIEWER'
                WHERE Name = 'interviewer';
                """);
        }
    }
}
