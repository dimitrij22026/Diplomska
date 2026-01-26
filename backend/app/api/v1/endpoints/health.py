from fastapi import APIRouter, status

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
async def read_health() -> dict[str, str]:
    """Basic readiness endpoint used by uptime checks."""
    try:
        print("Health called")
        return {"status": "ok"}
    except Exception as e:
        print(f"Health error: {e}")
        return {"status": "error", "message": str(e)}
