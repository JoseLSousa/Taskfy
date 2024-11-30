using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController(UserManager<User> userManager, ApplicationDbContext context) : ControllerBase
    {
        private readonly UserManager<User> _userManager = userManager;
        private readonly ApplicationDbContext _context = context;

        [HttpPost]
        public async Task<IActionResult> AddTask([FromBody] TaskModel taskModel)
        {
            if (taskModel == null) return BadRequest("Task data is Invalid");

            var userId = User.Identity?.Name;

            if (userId == null) return Unauthorized("User not authenticated");

            var user = await _userManager.FindByNameAsync(userId);
            if (user == null) return Unauthorized("User not Found");

            taskModel.UserId = user.Id;

            _context.Tasks.Add(taskModel);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTask), new { id = taskModel.Id }, taskModel);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null) return NotFound();

            return Ok(task);
        }
        [HttpGet("today")]
        public async Task<IActionResult> TodayTasksAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return Unauthorized("User not autenticated");

            var today = DateTime.Today;

            var tasks = await _context.Tasks
            .Where(t => t.UserId == userId && t.DueDate.Date == today)
            .ToListAsync();

            return Ok(tasks);
        }
    }
}