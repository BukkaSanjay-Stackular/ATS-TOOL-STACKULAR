using Microsoft.AspNetCore.Identity;

namespace ATStool.Models
{
    public class User:IdentityUser
    {
        public string FullName { get; set; }
        public string UserType { get; set; }
    }
}
