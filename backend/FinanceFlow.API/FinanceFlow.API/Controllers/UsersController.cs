using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using FinanceFlow.Api.Models;

[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IWebHostEnvironment _env;

    public UsersController(
        UserManager<AppUser> userManager,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _env = env;
    }

    // =========================
    // GET /api/users/me
    // =========================
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            profileImage = user.ProfileImagePath
        });
    }

    // =========================
    // POST /api/users/profile-image
    // =========================
    [HttpPost("profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nincs fájl.");

        if (file.ContentType != "image/png")
            return BadRequest("Csak PNG engedélyezett.");

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var folder = Path.Combine(_env.WebRootPath, "avatars");
        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        // IdentityUser.Id = string
        var filePath = Path.Combine(folder, $"{user.Id}.png");

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfileImagePath = $"/avatars/{user.Id}.png";
        await _userManager.UpdateAsync(user);

        return Ok(new { imageUrl = user.ProfileImagePath });
    }
}
