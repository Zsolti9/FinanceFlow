using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinanceFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public DataController(ApplicationDbContext context) {
            _context = context; 
        }
        [HttpPost("addUserData")]
        public async Task<IActionResult> CreateUserDataAsync([FromBody] DataDto dto)
        {
            UserData data = new UserData
            {
                Auto = dto.Auto,
                Fizetes = dto.Fizetes,
                BenzinKolt = dto.Benzinkolt,
                LakasKolt = dto.Lakaskolt,
                Lakas = dto.Lakhatas,
                Egyeb = dto.Egyeb,
                Szamlak = dto.Szamlak,
                UserId = dto.UserId,
            };
            await _context.UserData.AddAsync(data);
            await _context.SaveChangesAsync();
            return Ok(data);
        }

    }
}
