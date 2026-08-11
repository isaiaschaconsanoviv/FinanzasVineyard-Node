using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace FinanzasVineyard.Models
{
    public class Corte
    {
        [Required]
        public int Id { get; set; }
        [Required, DataType(DataType.DateTime)]
        public DateTime Fecha { get; set; }
        public string? Notas { get; set; }
        [Required, Display(Name = "Elaborado Por")]
        public string? ElaboradoPor { get; set; }
    }
}
