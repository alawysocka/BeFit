using System.ComponentModel.DataAnnotations;

namespace BeFit.Models;

public class EditTrainingModel
{
    [Required(ErrorMessage = "Limit miejsc jest wymagany.")]
    [Range(1, 100, ErrorMessage = "Limit miejsc musi mieścić się w przedziale od 1 do 100.")]
    public int Capacity { get; set; }
}