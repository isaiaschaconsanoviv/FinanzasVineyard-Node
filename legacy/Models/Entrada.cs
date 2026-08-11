using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class Entrada
    {
        [Required]
        public int Id { get; set; }
        [Required, DataType(DataType.DateTime)]
        public DateTime Fecha { get; set; }
        [Required, Display(Name = "Tipo de Cambio")]
        public double TipoCambio { get; set; }
        public string? Notas { get; set; }
        [Required, Display(Name = "Elaborado Por")]
        public string? ElaboradoPor { get; set; }

    }
}
