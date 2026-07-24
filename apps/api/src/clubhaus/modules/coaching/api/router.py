from fastapi import APIRouter

from clubhaus.modules.coaching.api.dashboard import router as dashboard_router
from clubhaus.modules.coaching.api.performance import router as performance_router
from clubhaus.modules.coaching.api.planning import router as planning_router
from clubhaus.modules.coaching.api.player_development import router as player_development_router
from clubhaus.modules.coaching.api.publications import router as publications_router
from clubhaus.modules.coaching.api.staff_reviews import router as staff_reviews_router

router = APIRouter()
router.include_router(dashboard_router)
router.include_router(planning_router)
router.include_router(publications_router)
router.include_router(staff_reviews_router)
router.include_router(player_development_router)
router.include_router(performance_router)
