using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ATStool.Models;

namespace ATStool.Data
{
    public class AppDbContext:IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options
            ):base(options)
        {
        }

        public DbSet<Jobs> Jobs { get; set; }
        public DbSet<Draft> Drafts { get; set; }
    }
}
