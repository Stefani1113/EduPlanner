FROM python:3.12-slim

WORKDIR /app

COPY ed-ms-mcp/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ed-ms-mcp/src ./src

ENV PYTHONPATH=/app/src

EXPOSE 8000

CMD ["python", "src/server.py"]