import socketio
import engineio
import eventlet

port = 5000
url = ''

sio = socketio.Server(async_mode='eventlet')
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'},
    '/index.html': {'content_type': 'text/html',
                    'filename': 'index.html'}
})

@sio.on('connect')
def on_connect(sid, environ):
    print('connected', sid)

@sio.on('test')
def on_test(sid, data):
    print('test', sid, data)
    sio.emit("response", {'data': 'foo'}, room=sid)

@sio.on('getAllLineData')
def on_getAllLineData(sid, data):
    get_all_line_data(sio, sid)

@sio.on('visualizeData')
def on_visualizeData(sid, data):
    visualize_data(sio, sid, data)

if __name__ == '__main__':
    print("server started")
    eventlet.wsgi.server(eventlet.listen((url, port)), app)

def send_to(sio, sid, name, data):
    sio.emit(name, data, room=sid)
