using System.ComponentModel.DataAnnotations;

namespace BeFit.Models;

public class CreateTrainingModel
{
    [Required(ErrorMessage = "Błędna nazwa")]
    [RegularExpression(@"^[^<>]*$", ErrorMessage = "Błędna nazwa")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Data jest wymagana.")]
    public DateTime Date { get; set; }

    [Required(ErrorMessage = "Godzina jest wymagana.")]
    public TimeSpan Time { get; set; }

    [Required(ErrorMessage = "Limit miejsc jest wymagany.")]
    [Range(1, 100, ErrorMessage = "Limit miejsc musi mieścić się w przedziale od 1 do 100.")]
    public int Capacity { get; set; }
}