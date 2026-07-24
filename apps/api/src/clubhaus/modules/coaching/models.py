"""Compatibility exports for coaching persistence models.

New code should import from ``coaching.infrastructure.models.<feature>``.
"""

from clubhaus.modules.coaching.infrastructure.models import (
    ChangeLogModel,
    MatchModel,
    MicrocycleModel,
    PerformanceImportModel,
    PerformanceMetricModel,
    PlayerGoalModel,
    PlayerIssueModel,
    PublicationModel,
    SessionBlockModel,
    StaffReviewModel,
    TrainingSessionModel,
)

__all__ = [
    "ChangeLogModel",
    "MatchModel",
    "MicrocycleModel",
    "PerformanceImportModel",
    "PerformanceMetricModel",
    "PlayerGoalModel",
    "PlayerIssueModel",
    "PublicationModel",
    "SessionBlockModel",
    "StaffReviewModel",
    "TrainingSessionModel",
]
