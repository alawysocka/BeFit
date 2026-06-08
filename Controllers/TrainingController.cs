using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BeFit.Models;

namespace BeFit.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TrainingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TrainingController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTrainings()
    {
        var trainings = await _context.Trainings
            .Include(t => t.Trainer)
            .OrderBy(t => t.Date).ThenBy(t => t.Time) 
            .Select(t => new {
                t.Id,
                t.Name,
                Date = t.Date.ToString("yyyy-MM-dd"),
                Time = t.Time.ToString(@"hh\:mm"),
                t.Capacity,
                TrainerName = $"{t.Trainer.FirstName} {t.Trainer.LastName}"
            })
            .ToListAsync();

        return Ok(trainings);
    }


    [HttpPost]
    [Authorize(Roles = "Trener")]
    public async Task<IActionResult> CreateTraining([FromBody] CreateTrainingModel model)
    {
        // pobranie ID trenera bezpośrednio z zaszyfrowanego tokena JWT
        var trainerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (trainerId == null)
            return Unauthorized(new { message = "Brak identyfikatora użytkownika w tokenie." });

        var training = new Training
        {
            Name = model.Name,
            Date = model.Date,
            Time = model.Time,
            Capacity = model.Capacity,
            TrainerId = trainerId 
        };

        _context.Trainings.Add(training);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Trening został pomyślnie dodany do grafiku." });
    }


    [HttpGet("mytrainings")]
    [Authorize(Roles = "Trener")]
    public async Task<IActionResult> GetMyTrainings()
    {
        var trainerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var trainings = await _context.Trainings
            .Where(t => t.TrainerId == trainerId)
            .OrderBy(t => t.Date).ThenBy(t => t.Time)
            .Select(t => new {
                t.Id,
                t.Name,
                Date = t.Date.ToString("yyyy-MM-dd"),
                Time = t.Time.ToString(@"hh\:mm"),
                t.Capacity
            })
            .ToListAsync();

        return Ok(trainings);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "Trener")]
    public async Task<IActionResult> EditTrainingCapacity(int id, [FromBody] EditTrainingModel model)
    {
        var trainerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var training = await _context.Trainings.FirstOrDefaultAsync(t => t.Id == id && t.TrainerId == trainerId);

        if (training == null)
            return NotFound(new { message = "Nie znaleziono treningu lub nie masz do niego praw." });

        training.Capacity = model.Capacity;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Limit miejsc został zaktualizowany." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Trener")]
    public async Task<IActionResult> DeleteTraining(int id)
    {
        var trainerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var training = await _context.Trainings.FindAsync(id);

        if (training == null)
            return NotFound(new { message = "Nie znaleziono treningu." });

        if (training.TrainerId != trainerId)
            return Forbid();

        _context.Trainings.Remove(training);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Trening został odwołany i usunięty z grafiku." });
    }

}