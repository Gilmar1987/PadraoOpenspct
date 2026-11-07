from celery import Celery

app = Celery("loja")
app.config_from_object("django.conf:settings", namespace="CELERY")
