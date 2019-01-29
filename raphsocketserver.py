import socketio
import engineio
import eventlet

port = 5000
url = ''

class RaphSocketServer:
    def __init__(self, datawrangler, port = 5000, url = ''):
        self.port = port
        self.url = url
        self.sio = socketio.Server(async_mode='eventlet')

        self.sio.on('getLineData', self.handle_line_data)
        self.sio.on('visualizeData', self.handle_visualize_data)

        self.app = socketio.WSGIApp(self.sio, static_files={
            '/': {'content_type': 'text/html', 'filename': 'public/index.html'},
            '/index.html': {'content_type': 'text/html', 'filename': 'public/index.html'},
            '/js/d3-extended/d3-extended.min.js': {'content_type': 'text/javascript', 'filename': 'public/js/d3-extended/d3-extended.min.js'},
            '/js/classes/DistanceMatrix.js': {'content_type': 'text/javascript', 'filename': 'public/js/classes/DistanceMatrix.js'},
            '/js/classes/DetailPathContainer.js': {'content_type': 'text/javascript', 'filename': 'public/js/classes/DetailPathContainer.js'},
            '/js/classes/SparkLineContainer.js': {'content_type': 'text/javascript', 'filename': 'public/js/classes/SparkLineContainer.js'},
            '/js/bootstrap/bootstrap-slider.min.js': {'content_type': 'text/javascript', 'filename': 'public/js/bootstrap/bootstrap-slider.min.js'},
            '/js/d3-lasso.min.js': {'content_type': 'text/javascript', 'filename': 'public/js/d3-lasso.min.js'},
            '/js/detailPath.js': {'content_type': 'text/javascript', 'filename': 'public/js/detailPath.js'},
            '/js/details.js': {'content_type': 'text/javascript', 'filename': 'public/js/details.js'},
            '/js/filter.js': {'content_type': 'text/javascript', 'filename': 'public/js/filter.js'},
            '/js/genmain.js': {'content_type': 'text/javascript', 'filename': 'public/js/genmain.js'},
            '/js/heatmap.js': {'content_type': 'text/javascript', 'filename': 'public/js/heatmap.js'},
            '/js/highlight.js': {'content_type': 'text/javascript', 'filename': 'public/js/highlight.js'},
            '/js/linechart.js': {'content_type': 'text/javascript', 'filename': 'public/js/linechart.js'},
            '/js/main.js': {'content_type': 'text/javascript', 'filename': 'public/js/main.js'},
            '/js/scatterplot.js': {'content_type': 'text/javascript', 'filename': 'public/js/scatterplot.js'},
            '/js/sparklines.js': {'content_type': 'text/javascript', 'filename': 'public/js/sparklines.js'},
            '/css/bootstrap-slider.css': {'content_type': 'text/css', 'filename': 'public/css/bootstrap-slider.css'},
            '/css/spinner.css': {'content_type': 'text/css', 'filename': 'public/css/spinner.css'},
            '/css/style.css': {'content_type': 'text/css', 'filename': 'public/css/style.css'}
        })
        self.datawrangler = datawrangler

    def start_server(self):
        eventlet.wsgi.server(eventlet.listen((self.url, self.port)), self.app)

    def send_to(self, to, header, data):
        self.sio.emit(header, data, room=to)

    def handle_line_data(self, sid, data=None):
        print("handle_line_data")
        self.send_to(sid, 'allLineData', self.datawrangler.get_all_line_data())
        self.send_to(sid, 'metaData', self.datawrangler.get_all_metadata())

    def handle_visualize_data(self, sid, data):
        print(data)
