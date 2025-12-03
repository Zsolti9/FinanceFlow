using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinanceFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {

        [HttpPost("addUserData")]
        public async Task<IUserService> CreateUserData([FromBody] DataDto dto)
        {

        }

    }
}
