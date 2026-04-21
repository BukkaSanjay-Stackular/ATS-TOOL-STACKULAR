// Controllers/AuthController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ATStool.Models;
using ATStool.DTOs;
using ATStool.Services;

namespace ATStool.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;

        public AuthController(UserManager<User> userManager, TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var validTypes = new[] { "Interviewee", "Recruiter", "Admin" };
            if (!validTypes.Contains(dto.UserType))
                return BadRequest("UserType must be Interviewee, Recruiter, or Admin.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email,
                UserType = dto.UserType   // ← UserType instead of Role
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, dto.UserType);  // ← UserType used as role

            return Ok(new { message = $"{dto.UserType} registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid email or password.");

            var roles = await _userManager.GetRolesAsync(user);
            var userType = roles.FirstOrDefault() ?? "Interviewee";

            var token = _tokenService.GenerateToken(user, userType);

            return Ok(new { token, userType, name = user.FullName, email = user.Email });
        }
    }
}