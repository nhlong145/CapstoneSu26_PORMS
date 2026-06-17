namespace PORMS.Application.DTOs.Risk;

public sealed record BatchUpdateRiskThresholdRequest(
    IReadOnlyList<UpdateRiskThresholdItemRequest> Thresholds);

public sealed record UpdateRiskThresholdItemRequest(
    Guid Id,
    decimal MinValue,
    decimal? MaxValue,
    string? Description,
    bool IsActive = true);
