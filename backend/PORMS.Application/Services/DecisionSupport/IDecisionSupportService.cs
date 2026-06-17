using PORMS.Application.DTOs.Ports;

namespace PORMS.Application.Services.DecisionSupport;

public interface IDecisionSupportService
{
    Task<PortDecisionSupportDto?> GetDecisionSupportAsync(
        Guid portId,
        CancellationToken cancellationToken = default);

    Task<PortLiveStatusDto?> GetLiveStatusAsync(
        Guid portId,
        bool includeSimulation = false,
        CancellationToken cancellationToken = default);
}
