// DTOs/AuthDto.cs
using System.ComponentModel.DataAnnotations;

namespace ATStool.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string UserType { get; set; }  
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "UserName is required.")]
        //[EmailAddress(ErrorMessage = "Invalid email format")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }
    }
}