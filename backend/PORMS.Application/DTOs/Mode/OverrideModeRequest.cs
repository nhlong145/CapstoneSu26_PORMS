using System.ComponentModel.DataAnnotations;
using PORMS.Domain.Enums;

namespace PORMS.Application.DTOs.Mode;

public sealed class OverrideModeRequest
{
    [Required]
    [EnumDataType(typeof(OperationMode))]
    public required OperationMode TargetMode { get; init; }

    [Required]
    [StringLength(
        1000,
        MinimumLength = 20,
        ErrorMessage = "Override reason must contain between 20 and 1000 characters.")]
    public required string OverrideReason { get; init; }
}
