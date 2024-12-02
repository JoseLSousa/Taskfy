using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dto;
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
        [HttpPost("add")]
        public async Task<IActionResult> AddTask([FromBody] TaskDto taskDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null) return Unauthorized("Usuário não autenticado");

                var task = new TaskModel
                {
                    Title = taskDto.Title,
                    Description = taskDto.Description,
                    Priority = taskDto.Priority,
                    StartDate = taskDto.StartDate,
                    EndDate = taskDto.EndDate,
                    UserId = userId
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao adicionar tarefa: {ex.Message}");
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null) return NotFound();

            return Ok(task);
        }
        
        [HttpGet]
        public async Task<IActionResult> GetTasksAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return Unauthorized("User not authenticated");

            var today = DateTime.Today;

            var tasks = await _context.Tasks
            .Where(t => t.UserId == userId)
            .ToListAsync();

            return Ok(tasks);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTaskAsync(int id, [FromBody] TaskDto updatedTask)
        {
            if (id != updatedTask.Id)
                return BadRequest("O ID da tarefa não corresponde ao ID fornecido.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existingTask = await _context.Tasks.FindAsync(id);
                if (existingTask == null)
                    return NotFound("Tarefa não encontrada.");

                existingTask.Title = updatedTask.Title;
                existingTask.Description = updatedTask.Description;
                existingTask.Priority = updatedTask.Priority;
                existingTask.StartDate = updatedTask.StartDate;
                existingTask.EndDate = updatedTask.EndDate;

                _context.Entry(existingTask).State = EntityState.Modified;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                    return NotFound("Erro ao atualizar a tarefa. Ela não existe mais.");
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao atualizar tarefa: {ex.Message}");
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTaskAsync(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return Unauthorized("Usuário não autenticado");

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null) return NotFound("Tarefa não encontrada ou você não tem permissão para excluí-la.");

            try
            {
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return StatusCode(500, $"Erro interno ao deletar tarefa: {ex.Message}");
            }
        }


        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}