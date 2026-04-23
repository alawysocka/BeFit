using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BeFit.Models;

namespace BeFit.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Uczestnik")] // Tylko klienci mogą rezerwować miejsca
public class ReservationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReservationController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 1. ZAPISYWANIE: Dodanie nowej rezerwacji
    [HttpPost]
    public async Task<IActionResult> BookTraining([FromBody] BookTrainingModel model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Pobieramy trening wraz z listą obecnych rezerwacji
        var training = await _context.Trainings
            .Include(t => t.Reservations)
            .FirstOrDefaultAsync(t => t.Id == model.TrainingId);

        if (training == null)
            return NotFound(new { message = "Wybrane zajęcia nie istnieją." });

        // LOGIKA BIZNESOWA: Czy jest już zapisany? (Zmieniono na ParticipantId)
        if (training.Reservations.Any(r => r.ParticipantId == userId))
            return BadRequest(new { message = "Jesteś już zapisany na te zajęcia." });

        // LOGIKA BIZNESOWA: Czy są wolne miejsca?
        if (training.Reservations.Count >= training.Capacity)
            return BadRequest(new { message = "Brak wolnych miejsc na te zajęcia." });

        // Wszystko się zgadza - tworzymy rezerwację dopasowaną do Twojego modelu
        var reservation = new Reservation
        {
            TrainingId = model.TrainingId,
            ParticipantId = userId // Używamy Twojej nazwy pola
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Pomyślnie zapisano na zajęcia!" });
    }

    // 2. ODCZYT: Pobieranie rezerwacji zalogowanego użytkownika (Mój Profil)
    [HttpGet("myreservations")]
    public async Task<IActionResult> GetMyReservations()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var reservations = await _context.Reservations
            .Where(r => r.ParticipantId == userId) // Zmieniono na ParticipantId
            .Include(r => r.Training)
            .ThenInclude(t => t.Trainer) // Dociągamy też dane trenera
            .OrderBy(r => r.Training.Date).ThenBy(r => r.Training.Time)
            .Select(r => new {
                ReservationId = r.Id,
                TrainingId = r.Training.Id,
                TrainingName = r.Training.Name,
                Date = r.Training.Date.ToString("yyyy-MM-dd"),
                Time = r.Training.Time.ToString(@"hh\:mm"),
                TrainerName = $"{r.Training.Trainer.FirstName} {r.Training.Trainer.LastName}"
            })
            .ToListAsync();

        return Ok(reservations);
    }

    // 3. ANULOWANIE: Rezygnacja z zajęć
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Szukamy rezerwacji, upewniając się, że należy do osoby, która chce ją usunąć (Zmieniono na ParticipantId)
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == id && r.ParticipantId == userId);

        if (reservation == null)
            return NotFound(new { message = "Nie znaleziono rezerwacji lub nie masz do niej praw." });

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Rezerwacja została pomyślnie anulowana." });
    }
}