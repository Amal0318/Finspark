import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.utils.logger import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        path = request.url.path
        
        logger.info(f"[{method}] {path} - Request Received")
        
        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            logger.info(
                f"[{method}] {path} - Completed {response.status_code} in {duration:.2f}ms"
            )
            response.headers["X-Process-Time-Ms"] = f"{duration:.2f}"
            return response
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"[{method}] {path} - Failed with error: {str(e)} in {duration:.2f}ms"
            )
            raise e
