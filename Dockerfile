FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
COPY frontend/dist ./frontend/dist
RUN pip install --no-cache-dir .

EXPOSE 8000

# Mount a volume at /app/data to persist SQLite sessions between containers.
# Run web server and API by default; pass ["kratosbot"] for CLI mode.
CMD ["kratosbot", "--serve", "--host", "0.0.0.0", "--port", "8000"]
