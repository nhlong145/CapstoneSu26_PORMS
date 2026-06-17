using System.ComponentModel.DataAnnotations;

namespace PORMS.Application.DTOs.Weather;

public sealed class ManualWeatherInputRequest
{
    [Required]
    public required Guid PortId { get; init; }

    [Required]
    [Range(0d, 100d)]
    public required decimal WindSpeedMs { get; init; }

    [Required]
    [Range(0d, 1000d)]
    public required decimal Rainfall1hMm { get; init; }

    [Required]
    [Range(0d, 50d)]
    public required decimal VisibilityKm { get; init; }

    [Range(-100d, 100d)]
    public decimal? TemperatureC { get; init; }

    [Range(0, 100)]
    public int? HumidityPct { get; init; }

    [Required]
    public required DateTimeOffset ObservedAt { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }
}
