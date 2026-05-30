"""ReplyVerse FastAPI entry point."""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings
from app.routes import analytics, auth, automations, billing, instagram, leads
from app.webhooks import meta as meta_webhook

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("replyverse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    log.info("ReplyVerse starting · env=%s", settings.ENVIRONMENT)
    yield
    log.info("ReplyVerse shutting down")


settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

app = FastAPI(
    title=settings.APP_NAME,
    description="Instagram comment-to-DM automation platform — REST API.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(instagram.router, prefix="/instagram", tags=["instagram"])
app.include_router(automations.router, prefix="/automations", tags=["automations"])
app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])
app.include_router(meta_webhook.router, prefix="/webhook", tags=["webhook"])


@app.get("/", tags=["health"])
async def root():
    return {"name": settings.APP_NAME, "version": "0.1.0", "env": settings.ENVIRONMENT}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):  # pragma: no cover
    log.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
