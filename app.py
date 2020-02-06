from flask import Flask, render_template, request, redirect, url_for
import pymysql.cursors

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    connection = pymysql.connect(
            host='db',
            port=3306,
            user='root',
            password='pass',
            db='website-db',
            charset='utf8',
            cursorclass=pymysql.cursors.DictCursor,
        )

    cur = connection.cursor()
    
    if request.method == 'POST':
        sql = ('INSERT INTO `results` (`name`, `record_time`, `record_time_str`) VALUES ("%s", %s, "%s")' % (request.form['name'], request.form['time'], request.form['timestr']))
        cur.execute(sql)
        connection.commit()
        return 'Done'

    #if request.method == 'GET':
    sql = 'select * from results ORDER BY record_time ASC'
    cur.execute(sql)
    results = cur.fetchall()
    record_times = []
    app.logger.debug('aaaaaa')
    for r in results:
        record_times.append(str(r['record_time']))
        
    cur.close() 
    connection.close()
    app.logger.debug('bbbbbbb')

    # index.html をレンダリングする
    return render_template('web.html', results=results, record_times=record_times)
    

if __name__ == '__main__':
    app.debug = True # デバッグモード有効化
    app.run(host='0.0.0.0') # どこからでもアクセス可能に
