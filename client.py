import socketio

sio = socketio.Client()

@sio.on('connect')
def on_connect():
    print('I\'m connected!')

@sio.on('message')
def on_message(data):
    print('I received a message!')

@sio.on('my message')
def on_message(data):
    print('I received a custom message!')

@sio.on('disconnect')
def on_disconnect():
    print('I\'m disconnected!')

@sio.on('response')
def on_response(data):
    print('response', data)

sio.connect('http://localhost:5000')
sio.emit('test', {'foo': 'bar'})

sio.wait()
