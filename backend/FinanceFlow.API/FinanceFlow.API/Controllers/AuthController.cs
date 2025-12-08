using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FinanceFlow.Api.Models;
using FinanceFlow.Api.DTOs;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Dtos;

namespace FinanceFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IJwtService _jwtService;

        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IJwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null) return BadRequest(new { error = "E-mail already registered" });

            var user = new AppUser { UserName = dto.Email, Email = dto.Email, DisplayName = dto.DisplayName };
            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);

            // opcionális: email confirmation token küldése itt

            // automatikus beléptetés / token kiadása
            var token = _jwtService.GenerateToken(user);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized(new { error = "Invalid credentials" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
            if (!result.Succeeded) return Unauthorized(new { error = "Invalid credentials" });

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new { token });
        }

        // ------------------ GET USER ----------------------
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Email,
                user.DisplayName
            });
        }

        // ------------------ UPDATE USER ----------------------
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Email és DisplayName frissítése
            user.DisplayName = dto.DisplayName ?? user.DisplayName;
            user.Email = dto.Email ?? user.Email;
            user.UserName = dto.Email ?? user.UserName;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(updateResult.Errors);

            // Jelszó csak akkor, ha meg van adva
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

                if (!passwordResult.Succeeded)
                    return BadRequest(passwordResult.Errors);
            }

            return Ok(new { message = "User updated successfully" });
        }

        // ------------------ DELETE USER ----------------------
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "User deleted successfully" });
        }


    }
}
