FROM python:3.12-slim

WORKDIR /app

COPY ed-ms-ia/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ed-ms-ia/ .

EXPOSE 5000

CMD ["python", "app.py"]