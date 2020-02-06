FROM python:3.6
WORKDIR /app/
RUN pip3 install flask
RUN pip3 install PyMySQL
CMD ["python3","app.py"]
