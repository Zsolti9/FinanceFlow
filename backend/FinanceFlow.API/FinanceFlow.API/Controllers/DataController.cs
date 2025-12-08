using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DataController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------- CREATE --------------------
        [HttpPost("addUserData")]
        public async Task<IActionResult> CreateUserDataAsync([FromBody] DataDto dto)
        {
            var data = new UserData
            {
                Auto = dto.Auto,
                Fizetes = dto.Fizetes,
                BenzinKolt = dto.Benzinkolt,
                LakasKolt = dto.Lakaskolt,
                Lakas = dto.Lakhatas,
                Egyeb = dto.Egyeb,
                Szamlak = dto.Szamlak,
                UserId = dto.UserId
            };

            await _context.UserData.AddAsync(data);
            await _context.SaveChangesAsync();

            return Ok(data);
        }

        // ------------------- GET BY USERID --------------------
        [HttpGet("getUserData/{userId}")]
        public async Task<IActionResult> GetUserData(string userId)
        {
            var data = await _context.UserData
                .Where(x => x.UserId == userId)
                .ToListAsync();

            if (data == null || data.Count == 0)
                return NotFound(new { message = "No data found for this user." });

            return Ok(data);
        }


        // ------------------- DELETE --------------------
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUserData(int id)
        {
            var data = await _context.UserData.FindAsync(id);
            if (data == null)
                return NotFound(new { message = "Data entry not found." });

            _context.UserData.Remove(data);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Data deleted successfully." });
        }

        // ------------------- UPDATE --------------------
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUserData(int id, [FromBody] DataDto dto)
        {
            var data = await _context.UserData.FindAsync(id);
            if (data == null)
                return NotFound(new { message = "Data entry not found." });

            data.Auto = dto.Auto;
            data.Fizetes = dto.Fizetes;
            data.BenzinKolt = dto.Benzinkolt;
            data.LakasKolt = dto.Lakaskolt;
            data.Lakas = dto.Lakhatas;
            data.Egyeb = dto.Egyeb;
            data.Szamlak = dto.Szamlak;
            // ❗ UserId NEM változik (ahogy kérted)

            await _context.SaveChangesAsync();

            return Ok(new { message = "Data updated successfully." });
        }
    }
}
