using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BeFit.Models;
using System.ComponentModel.DataAnnotations;

namespace BeFit.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Administrator")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("whitelist")]
    public IActionResult GetWhitelist()
    {
        var trainers = _context.Trainers.Select(t => new { t.Id, t.Email }).ToList();
        return Ok(trainers);
    }

    [HttpPost("whitelist")]
    public IActionResult AddToWhitelist([FromBody] TrainerEmailModel model)
    {
        if (_context.Trainers.Any(t => t.Email == model.Email))
        {
            return BadRequest(new { message = "Ten adres email znajduje się już na liście." });
        }

        var trainer = new Trainer { Email = model.Email };
        _context.Trainers.Add(trainer);
        _context.SaveChanges();

        return Ok(new { message = "Dodano adres email do weryfikacji trenerów." });
    }
}

public class TrainerEmailModel
{
    [Required(ErrorMessage = "Adres email jest wymagany.")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email.")]
    public string Email { get; set; } = string.Empty;
}