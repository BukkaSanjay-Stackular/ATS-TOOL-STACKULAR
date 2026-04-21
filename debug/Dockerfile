FROM python:3.11
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info

WORKDIR /app

COPY . .

RUN pip install weasyprint

CMD ["python", "demo.py"]